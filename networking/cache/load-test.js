const CacheClient = require('./cache-client');
const { performance } = require('perf_hooks');

const utils = require("../../utils");

const HOST = 'localhost';
const PORT = 7070;
const OPERATIONS_COUNT = 8; // Number of operations for set, get

async function loadTest() {
    const cache = new CacheClient(HOST, PORT);
    await cache.connect();
    console.log(`Connected to cache server at ${HOST}:${PORT}`);

    let startTime, endTime;

    // Test SET operation
    startTime = performance.now();


    async function performSetOperations(OPERATIONS_COUNT) {
        for (let i = 0; i < OPERATIONS_COUNT; i++) {
            // console.log(`Setting key${i} to value${i}`);
            await cache.set(`key${i}`, `value${i}`);
            // await utils.sleep(100); // Wait for 100 ms before proceeding to the next iteration
        }
    }
    
    await performSetOperations(OPERATIONS_COUNT)
    
    endTime = performance.now();
    console.log(`SET: Completed ${OPERATIONS_COUNT} operations in ${(endTime - startTime).toFixed(2)}ms`);

    //Test GET operation
    startTime = performance.now();
    async function performGetOperations(OPERATIONS_COUNT) {
        for (let i = 0; i < OPERATIONS_COUNT; i++) {
            // console.log(`Getting key${i} to value${i}`);
            await cache.get(`key${i}`);
            // await utils.sleep(100); // Wait for 100 ms before proceeding to the next iteration
        }
    }
    
    await performGetOperations(OPERATIONS_COUNT);
    endTime = performance.now();
    console.log(`GET: Completed ${OPERATIONS_COUNT} operations in ${(endTime - startTime).toFixed(2)}ms`);

    // Test DEL operation
    // startTime = performance.now();
    // await Promise.all(
    //     Array.from({ length: OPERATIONS_COUNT }, (_, i) =>
    //         cache.del(`key${i}`)
    //     )
    // );
    // endTime = performance.now();
    // console.log(`DEL: Completed ${OPERATIONS_COUNT} operations in ${(endTime - startTime).toFixed(2)}ms`);

    console.log("ALL TEST COMPLETED");
    cache.close();
}

loadTest().catch(err => {
    console.error('Load test failed:', err);
});
