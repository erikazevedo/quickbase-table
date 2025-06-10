/**
 * Class for interacting with a quickbase table.
 * Handles authentication using browser cookies
 */
class QuickbaseTable {
    static tableId = null;
    static host = '';
    static RECORD_ID = 3;
    static EQUALS = 'EX';
    static GREATER_THAN = 'GT';
    static LESS_THAN = 'LT';

    /**
     * Refresh authentication token on the instance. 
     * If a token exists on the window we will use it rather than
     * the temp auth
     */
    static async getToken() {
        if (!this.tableId) {
            return null;
        }
        if (window.QB_TOKEN) {
            this.token = window.QB_TOKEN;
        }
        else {
            // Ask Quickbase for a token
            const resp = await fetch(`https://api.quickbase.com/v1/auth/temporary/${this.tableId}`, {
                headers: {
                    'QB-Realm-Hostname': this.host,
                    'User-Agent': 'CodePage',
                    // 'QB-App-Token': '{QB-App-Token}',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
            });
            const data = await resp.json();
            const token = data.temporaryAuthorization;
            if (token) {
                this.token = `QB-TEMP-TOKEN ${token}`;
                // Expire the token after 5 minutes locally
                // (QB does it serverside)
                setTimeout(() => { 
                    this.token = null; 
                    console.log('Token expired');
                }, 300000);
            } else {
                console.log("Unable to auth with Quickbase");
            }
        }
    }

    /**
     * Call the QB API handling authentication and retries as needed.
     * @param {string} endpoint API endpoint to call
     * @param {string} method HTTP method to use (defaults to "POST")
     * @param {Object} body Object body of the request.
     * @returns Object response of the request
     */
    static async callAPI(endpoint, method = "POST", body = null, signal = null) {
        // Get a token if we don't have one
        if (!this.token) {
            await this.getToken();
        }
        const maxTries = 1;
        let tryCount = 0;
        this.fetching = true;
        // Enter retry loop
        while (true) {

            const requestOptions = {
                method: method,
                headers: {
                    'QB-Realm-Hostname': this.host,
                    'User-Agent': 'CodePage',
                    // 'QB-App-Token': '{QB-App-Token}',
                    'Content-Type': 'application/json',
                    'Authorization': this.token,
                },
                signal: signal
            }
    
            if (body) {
                requestOptions.body = JSON.stringify(body);
            }
    
            // Fetch data from Quickbase
            let resp = null;
            try {
                resp = await fetch(
                    "https://api.quickbase.com/v1" + endpoint,
                    requestOptions);
            } 
            catch {
                this.fetching = false;
                return {};
            }

            // Return data if reponse was ok (200)
            if (resp.ok) {
                this.fetching = false;
                const ctype = resp.headers.get("content-type");
                if (ctype.includes("application/json")) {
                    return await resp.json();
                }
                else {
                    return await resp.blob();
                }
            }

            // Wait some time if we are going too fast
            else if (resp.status == 429) {
                const headers = resp.headers;
                const tryAfterSeconds = parseInt( headers.get("retry-after") );
                await new Promise(r => setTimeout(r, tryAfterSeconds * 1000));
            }

            // If the response is something else, try to get a new token
            else {
                await this.getToken(); 
            }
            
            // Throw an error after too many tries
            if (tryCount >= maxTries) {
                this.fetching = false;
                throw new Error(resp.status);

            } else {
                tryCount += 1;
            }
        }
    }

    // static async getUsers() {
    //     const data = await this.callAPI('/users');
    //     return data;
    // }

    /**
     * Get the primary key for the table
     * @returns Primary key integer ID 
     */
    static async getPrimaryKey() {
        // console.log(`Fetch primary key for ${this.tableId}`);
        let primaryKey = null;
        const data = await this.callAPI(`/fields?tableId=${this.tableId}`, "GET");
        for (const fld of data) {
            if (fld.properties.primaryKey) {
                primaryKey = fld.id;
            }
        }
        return primaryKey;
    }

    /**
     * Get a QB report by ID and return the data. This is the simplest way to get data for tables since it
     * is easier to build and tweak filters in the QB GUI than in Javascript
     * @param {number} reportId ID of the report to get
     * @param {number} top Limit to a certain number of records. If omitted QB will decide
     * @param {number} skip Number of records to skip. Use with top for pagination
     * @returns Data object containing records and fields
     */
    static async getReport(reportId, top = null, skip = null) {
        let query = `/reports/${reportId}/run?tableId=${this.tableId}${top ? `&top=${top}` : ""}${skip ? `&skip=${skip}` : ""}`
        const data = await this.callAPI(query);

        // Build a reference of field name and type by ID
        let fieldsDict = {};
        const fields = data.fields;
        for (const field of fields) {
            fieldsDict[field.id] = {
                label: field.label,
                type: field.type,
            };
        }

        // Store field information on each record for easier usage
        let results = [];
        for (const record of data.data) {
            let newrecord = {};
            for (const key of Object.keys(record)) {
                newrecord[key] = {
                    label: fieldsDict[key].label,
                    type: fieldsDict[key].type,
                    value: record[key].value,
                };
            }
            results.push(newrecord);
        }
        data.data = results;
        data.fieldsById = fieldsDict;

        return data;
    }

    /**
     * Get metadata for a report
     * @param {number} reportId ID of report to get metadata for
     * @returns Metadata object of report
     */
    static async getReportMeta(reportId) {
        return await this.callAPI(`/reports/${reportId}?tableId=${this.tableId}`, "GET");
    }

    /**
     * Create new records on the table. Provide the key field to update an existing record
     * @param {Object} data Records to create. Pass in an array of new record objects of the form:
     * [{fieldId1: fieldValue1, fieldId2: fieldValue2, ...}, ...]
     * @returns Success/fail data object
     */
    static async createRecords(data) {
        const payload = {
            to: this.tableId,
            data: [],
            fieldsToReturn: [],
        }

        for (const item of data) {
            const newRecord = {};
            for (const [fieldId, fieldValue] of Object.entries(item)) {
                newRecord[fieldId] = {value: fieldValue};
                if (!payload.fieldsToReturn.includes(fieldId)) {
                    payload.fieldsToReturn.push(fieldId);
                }
            }
            payload.data.push(newRecord);
        }

        const returnData = await this.callAPI("/records", "POST", payload);
        return returnData;
    }

    /**
     * Search for records based on a query in quickbase query language.
     * @param {Object} options Options Object
     * @param {string} options.query The Query string in Quickbase Query Language
     * @param {number[]} options.fields Array of field IDs to return. If not provided, will return default fields
     * @param {number} options.maxResults Maximum number of results to return
     * @param {Object[]} options.sortBy Array of {fieldId: number, order: 'ASC' or 'DESC'} to sort results
     * @param {number} options.skip Number of results to skip, for pagination
     * @returns Object including resulting records and field data
     */
    static async search(options) {
        return await this.searchRecords(
            options.query, 
            options.fields, 
            options.maxResults, 
            options.sortBy,
            options.skip
        );
    }

    /**
     * (Deprecated) Search for records based on a query in quickbase query language.
     * @param {string} query Query in quickbase query language
     * @param {number[]} fields Array of field IDs to return. If not provided, will return default fields
     * @param {number} maxResults Maximum number of results to return
     * @returns Object including resulting records and field data
     */
    static async searchRecords(query, fields = null, maxResults = null, sortBy = null, skip = null, signal = null) {
        // Get primary key if we don't have it already
        if (!this.primaryKey) {
            this.primaryKey = await this.getPrimaryKey();
        }

        const payload = {
            from: this.tableId,
            where: query,
        };

        if (fields) {
            const fieldsToGet = fields;
            if (!fields.includes(this.primaryKey)) {
                fieldsToGet.push(this.primaryKey);
            }
            payload.select = fieldsToGet;
        };

        if (sortBy) {
            payload.sortBy = sortBy;
        }

        if (maxResults) {
            payload.options = {};
            payload.options.top = maxResults;
            if (skip) {
                payload.options.skip = skip;
            }
        };
        let data = await this.callAPI("/records/query", "POST", payload, signal = signal)
        // "rehydrate" the data with field names to make it easier to use
        if (data.data) {
            for (const i in data.data) {
                for (const [key, obj] of Object.entries(data.data[i])) {
                    for (const field of data.fields) {
                        if (key == field.id) {
                            data.data[i][key].label = field.label;
                            data.data[i][key].type = field.type;
                            data.data[i][key].primary = (key == this.primaryKey);
                            data.data[i].primaryKey = this.primaryKey;
                        }
                    }
                }
            }
        }

        data.fieldsById = {};

        if (data.fields) {
            for (const i in data.fields) {
                data.fields[i].primary = (data.fields[i].id == this.primaryKey);
                data.fieldsById[data.fields[i].id] = data.fields[i];
            }
        }

        return data;
    }

    /**
     * Get a specific record by its ID.
     * @param {number} recordId ID of the record
     * @param {number[]} fields Array of field IDs to return. If not provided, will return default fields 
     * @returns The record data if it exists.
     */
    static async getRecordById(recordId, fields = null) {
        const search = await this.searchRecords(`{3.EX.${recordId}}`, fields);
        const data = search.data[0];
        if (data) {
            return {
                data: data,
                fields: search.fields,
            }
        }
    }

    /**
     * Create a data URI for a resource endpoint (like an image)
     * @param {string} path URL endpoint to get 
     * @returns Data URI 
     */
    static async getHref(path) {
        // Quickbase gives us the file as a base64 string
        const data = await this.callAPI(path, "GET");
        return `data:${data.type};base64,${await data.text()}`;
    }

    /**
     * Get an image resource from an endpoint and show it in a new tab/window
     * @param {string} path URL endpoint to get
     */
    static async openImage(path) {
        const data = await this.getHref(path);
        let w = window.open("about:blank");
        let image = new Image();
        image.src = data;
        setTimeout(function() {
            w.document.getElementsByTagName("body")[0].innerHTML = image.outerHTML;
        }, 0);
    }

    /**
     * Get an image resource from an endpoint and download it
     * @param {string} path URL endpoint to get
     */
    static async getFile(path, name, download = true) {
        const a = document.createElement("a");
        a.href = await this.getHref(path);
        if (download) {a.download = name};
        a.target = "_blank";
        a.click();
        a.remove();
    }

    /**
     * Delete records based on a query string
     * @param {string} query the query string
     */
    static async deleteRecords(query) {
        return await this.callAPI('/records', 'DELETE', {
            from: this.tableId,
            where: query
        })
    }
}

export default QuickbaseTable;