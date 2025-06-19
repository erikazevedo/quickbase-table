async function main() {
    const qbt = await import('../src/QuickbaseTable.js')
    const { describe, it } = await import('node:test');
    const assert = await import('node:assert');
    const { Agent } = await import('undici');

    class TestTable extends qbt.default {
        static agent = new Agent({
            connect: {
                rejectUnauthorized: false
            }
        });
        static userToken = process.env.QB_TOKEN;
        static tableId = process.env.TABLE;
        static host = process.env.REALM;
        static ID = 14; // Needs to be a unique field in quickbase for tests to pass
        static MESSAGE = 16;
    }

    describe('ensure token exists', ()=> {
        it('should not be undefined', () => {
            assert.notEqual(process.env.QB_TOKEN, undefined)
        })
    })

    describe('create records', async () => {
        const newRecordId = parseInt(Math.random()*10000);
        
        await it('create a record', async () => {
            const r = await TestTable.createRecords([{
                [TestTable.ID]: `test-id-${newRecordId}`, 
                [TestTable.MESSAGE]: 'test-message-message'
            }], TestTable.ID);
            assert.ok(r && r.metadata && r.metadata.createdRecordIds && r.metadata.createdRecordIds.length);
        });

        await it('update the record', async () => {
            const r = await TestTable.createRecords([{
                [TestTable.ID]: `test-id-${newRecordId}`, 
                [TestTable.MESSAGE]: `test-message-${parseInt(Math.random()*10000)}`
            }], TestTable.ID);
            assert.ok(r && r.metadata && r.metadata.createdRecordIds && r.metadata.updatedRecordIds.length);
        })
    })
}

main()