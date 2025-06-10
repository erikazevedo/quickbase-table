# Quickbase-Table

This is a NodeJS module for interacting with tables via the Quickbase REST API. If you are building a Quickbase code page application, this is the module for you. It is targeted at the client side. 

If used within a code page, authentication is handled automatically based on the current user's browser session. 

## Usage in Development
For local development or testing outside of Quickbase, the module looks for `QB_TOKEN` on `window`:

`window.QB_TOKEN = 'QB-USER-TOKEN { your token here }`;

> [!WARNING]
> Store your token in a separate file that is included in .gitignore to avoid exposing it.

I recommend using `vite` with `vite-plugin-singlefile` to bundle single-page apps for convenience when creating code pages.

## Usage

[API documentation](src/API.md)

`QuickbaseTable` is the only class provided. Extend it to provide the details about your table:
```javascript
import QuickbaseTable from "quickbase-table";

class Projects extends QuickbaseTable {
    // Required, this ID can be found in the URL in Quickbase when navigating to the table
    static tableId = 'my-table-id';

    // Required, this is your Quickbase realm
    static host = 'my-realm.quickbase.com';

    // Optionally, define names for your field IDs to make referencing them easier.
    static NAME = 6;
    static ADDRESS = 7;
    static CITY = 8;
    static STATE = 9;
}
```

Now you can use it:
```javascript
const apiData = await Projects.search({
    // Query string in Quickbase query language. Go here to learn how to write these:
    // https://helpv2.quickbase.com/hc/en-us/articles/4418287644308-Components-of-a-Query
    query: `{${Projects.NAME}.EX.'my first project'}`,

    // Optional, fields to return in search. This is just an array of field ID integers.
    // You can use the static variables defined on the class to help to remember the fields.
    // If omitted, the default fields for the table will be returned. 
    fields: [
        Projects.NAME,
        Projects.ADDRESS,
        Projects.CITY,
        Projects.STATE
    ],

    // Optional, an array to sort results. 
    sortBy: [
        {
            fieldId: Projects.PHASE,
            order: 'ASC' // Or 'DESC'
        }
    ]
})
projects.value = r.data;
```
