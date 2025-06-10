<a name="QuickbaseTable"></a>

## QuickbaseTable
Class for interacting with a quickbase table.Handles authentication using browser cookies

**Kind**: global class  

* [QuickbaseTable](#QuickbaseTable)
    * [.getToken()](#QuickbaseTable.getToken)
    * [.callAPI(endpoint, method, body)](#QuickbaseTable.callAPI) ⇒
    * [.getPrimaryKey()](#QuickbaseTable.getPrimaryKey) ⇒
    * [.getReport(reportId, top, skip)](#QuickbaseTable.getReport) ⇒
    * [.getReportMeta(reportId)](#QuickbaseTable.getReportMeta) ⇒
    * [.createRecords(data)](#QuickbaseTable.createRecords) ⇒
    * [.search(options)](#QuickbaseTable.search) ⇒
    * [.searchRecords(query, fields, maxResults)](#QuickbaseTable.searchRecords) ⇒
    * [.getRecordById(recordId, fields)](#QuickbaseTable.getRecordById) ⇒
    * [.getHref(path)](#QuickbaseTable.getHref) ⇒
    * [.openImage(path)](#QuickbaseTable.openImage)
    * [.getFile(path)](#QuickbaseTable.getFile)
    * [.deleteRecords(query)](#QuickbaseTable.deleteRecords)

<a name="QuickbaseTable.getToken"></a>

### QuickbaseTable.getToken()
Refresh authentication token on the instance. If a token exists on the window we will use it rather thanthe temp auth

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
<a name="QuickbaseTable.callAPI"></a>

### QuickbaseTable.callAPI(endpoint, method, body) ⇒
Call the QB API handling authentication and retries as needed.

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Object response of the request  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | API endpoint to call |
| method | <code>string</code> | <code>&quot;POST&quot;</code> | HTTP method to use (defaults to "POST") |
| body | <code>Object</code> | <code></code> | Object body of the request. |

<a name="QuickbaseTable.getPrimaryKey"></a>

### QuickbaseTable.getPrimaryKey() ⇒
Get the primary key for the table

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Primary key integer ID  
<a name="QuickbaseTable.getReport"></a>

### QuickbaseTable.getReport(reportId, top, skip) ⇒
Get a QB report by ID and return the data. This is the simplest way to get data for tables since itis easier to build and tweak filters in the QB GUI than in Javascript

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Data object containing records and fields  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| reportId | <code>number</code> |  | ID of the report to get |
| top | <code>number</code> | <code></code> | Limit to a certain number of records. If omitted QB will decide |
| skip | <code>number</code> | <code></code> | Number of records to skip. Use with top for pagination |

<a name="QuickbaseTable.getReportMeta"></a>

### QuickbaseTable.getReportMeta(reportId) ⇒
Get metadata for a report

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Metadata object of report  

| Param | Type | Description |
| --- | --- | --- |
| reportId | <code>number</code> | ID of report to get metadata for |

<a name="QuickbaseTable.createRecords"></a>

### QuickbaseTable.createRecords(data) ⇒
Create new records on the table. Provide the key field to update an existing record

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Success/fail data object  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Records to create. Pass in an array of new record objects of the form: [{fieldId1: fieldValue1, fieldId2: fieldValue2, ...}, ...] |

<a name="QuickbaseTable.search"></a>

### QuickbaseTable.search(options) ⇒
Search for records based on a query in quickbase query language.

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Object including resulting records and field data  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options Object |
| options.query | <code>string</code> | The Query string in Quickbase Query Language |
| options.fields | <code>Array.&lt;number&gt;</code> | Array of field IDs to return. If not provided, will return default fields |
| options.maxResults | <code>number</code> | Maximum number of results to return |
| options.sortBy | <code>Array.&lt;Object&gt;</code> | Array of {fieldId: number, order: 'ASC' or 'DESC'} to sort results |
| options.skip | <code>number</code> | Number of results to skip, for pagination |

<a name="QuickbaseTable.searchRecords"></a>

### QuickbaseTable.searchRecords(query, fields, maxResults) ⇒
(Deprecated) Search for records based on a query in quickbase query language.

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Object including resulting records and field data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| query | <code>string</code> |  | Query in quickbase query language |
| fields | <code>Array.&lt;number&gt;</code> | <code></code> | Array of field IDs to return. If not provided, will return default fields |
| maxResults | <code>number</code> | <code></code> | Maximum number of results to return |

<a name="QuickbaseTable.getRecordById"></a>

### QuickbaseTable.getRecordById(recordId, fields) ⇒
Get a specific record by its ID.

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: The record data if it exists.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| recordId | <code>number</code> |  | ID of the record |
| fields | <code>Array.&lt;number&gt;</code> | <code></code> | Array of field IDs to return. If not provided, will return default fields |

<a name="QuickbaseTable.getHref"></a>

### QuickbaseTable.getHref(path) ⇒
Create a data URI for a resource endpoint (like an image)

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  
**Returns**: Data URI  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | URL endpoint to get |

<a name="QuickbaseTable.openImage"></a>

### QuickbaseTable.openImage(path)
Get an image resource from an endpoint and show it in a new tab/window

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | URL endpoint to get |

<a name="QuickbaseTable.getFile"></a>

### QuickbaseTable.getFile(path)
Get an image resource from an endpoint and download it

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | URL endpoint to get |

<a name="QuickbaseTable.deleteRecords"></a>

### QuickbaseTable.deleteRecords(query)
Delete records based on a query string

**Kind**: static method of [<code>QuickbaseTable</code>](#QuickbaseTable)  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | the query string |

