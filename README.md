# Quickbase-Table

This is a NodeJS module for interacting with tables via the Quickbase REST API. If you are building a Quickbase code page application, this is the module for you. It is targeted at the client side. 

If used within a code page, authentication is handled automatically based on the current user's browser session. 

## Usage in Development
For local development or testing outside of Quickbase, set the following in your browser console or script:
window.QB_TOKEN = 'QB-USER-TOKEN { your token here }';

Important: Store your token in a separate file that is included in .gitignore to avoid exposing it.

I recommend using `vite` with `vite-plugin-singlefile` to bundle single-page apps for convenience when creating code pages.

## Usage

