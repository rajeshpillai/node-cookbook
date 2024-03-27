const CacheClient = require('./cache-client'); 
const { v4: uuidv4 } = require('uuid');

const HOST = 'localhost';
const PORT = 7070;
const CLIENT_COUNT = 1000; // Number of parallel clients
const REQUESTS_PER_CLIENT = 10; // Number of requests per client

// Helper function to sleep for a given ms
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Perform a series of commands from a single client
async function performClientOperations(client, clientId) {
  const startTime = Date.now();
  for (let i = 0; i < REQUESTS_PER_CLIENT; i++) {
      const key = `key${clientId}_${i}`;
      const value = `value${clientId}_${i}`;

      try {
          await client.set(key, value);
          console.log(`Client ${clientId}: Set ${key}`);
          const retrievedValue = await client.get(key);
          console.log(`Client ${clientId}: Got ${key}, value: ${retrievedValue}`);
      } catch (error) {
          console.error(`Client ${clientId}: Error ${error.message}`);
      }
  }
  const endTime = Date.now();
  console.log(`Client ${clientId} completed in ${(endTime - startTime)}ms`);
}

async function main() {
  console.log('Starting load test...');
  const testStartTime = Date.now();

  let clients = [];
  for (let i = 0; i < CLIENT_COUNT; i++) {
      let client = new CacheClient(HOST, PORT);
      await client.connect();
      clients.push(client);
  }

  // Perform operations in parallel and measure the time
  await Promise.all(clients.map((client, index) => performClientOperations(client, index)));

  // Close all clients
  clients.forEach(client => client.close());

  const testEndTime = Date.now();
  const totalTestTime = (testEndTime - testStartTime) / 1000; // Convert to seconds
  const totalRequests = REQUESTS_PER_CLIENT * CLIENT_COUNT;
  const requestsPerSecond = totalRequests / totalTestTime;

  console.log(`All operations completed in ${totalTestTime} seconds.`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Requests per Second (RPS): ${requestsPerSecond.toFixed(2)}`);
}

main().catch(console.error);

