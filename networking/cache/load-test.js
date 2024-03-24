const CacheClient = require('./cache-client');
const { performance } = require('perf_hooks');

const HOST = 'localhost';
const PORT = 7070;
const OPERATIONS_COUNT = 3; // Number of operations for set, get, and del

async function loadTest() {
    const cache = new CacheClient(HOST, PORT);
    await cache.connect();
    console.log(`Connected to cache server at ${HOST}:${PORT}`);

    let startTime, endTime;

    // Test SET operation
    startTime = performance.now();

    const operations = Array.from({ length: OPERATIONS_COUNT }, (_, i) => {
        console.log(`Setting key${i} to value${i}`);
        return cache.set(`key${i}`, `value${i}`);
    });
    await Promise.all(operations);

    console.log("Keys added for load testing...");
    endTime = performance.now();
    console.log(`SET: Completed ${OPERATIONS_COUNT} operations in ${(endTime - startTime).toFixed(2)}ms`);

    //Test GET operation
    startTime = performance.now();
    await Promise.all(
        Array.from({ length: OPERATIONS_COUNT }, (_, i) =>
            cache.get(`key${i}`)
        )
    );
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

    cache.close();
}

loadTest().catch(err => {
    console.error('Load test failed:', err);
});
