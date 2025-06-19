import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import QuickbaseTable from '../../../../src/QuickbaseTable.js'

const { VITE_TOKEN, VITE_REALM, VITE_TABLE } = import.meta.env 

class TestTable extends QuickbaseTable {
    static userToken = VITE_TOKEN;
    static tableId = VITE_TABLE;
    static host = VITE_REALM;
    static ID = 14; // Needs to be a unique field in quickbase for tests to pass
    static MESSAGE = 16;
}

async function main() {
    const r = await TestTable.search({
        query: `{3.GT.'0'}`,
        fields: [TestTable.ID, TestTable.MESSAGE]
    })
    console.log(r)
    document.querySelector('#nresults').innerHTML = r.data.length
}

main()


document.querySelector('#app').innerHTML = `
    <div>
        <h1>QB TEST</h1>
        <p class="read-the-docs">
            Found <span id="nresults"></span> results in Quickbase
        </p>
    </div>
`
