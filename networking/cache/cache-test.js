const CacheClient = require('./cache-client');

async function main() {
    const cache = new CacheClient('localhost', 7070);

    try {
        await cache.connect();
        console.log('Connected to cache server.');

        await cache.set('test', '123');
        console.log('Set operation complete.');

        
        await cache.set('json', {a: "123", b:"346"});
        console.log('Set operation complete.');

        await cache.set('arr', [1,2,3,4,5]);
        console.log('Set operation complete.');


        const value = await cache.get('test');
        console.log('Get operation complete. Value:', value);

        const value2 = await cache.get('json');
        console.log('Get operation complete. Value:', value2);

        const value3 = await cache.get('arr');
        console.log('Get operation complete. Value:', value3);


        await cache.del('test');
        console.log('Del operation complete.');

        cache.close();
        console.log('Connection closed.');
    } catch (err) {
        console.error('Cache operation failed:', err);
    }
}

main();
