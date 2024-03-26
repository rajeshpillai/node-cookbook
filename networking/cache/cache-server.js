const net = require("net");
const { Mutex } = require("async-mutex");

const dataStore = {};
const keyLocks = new Map(); // Stores locks for each key

// Helper function to get or create a lock for a specific key
function getLockForKey(key) {
  if (!keyLocks.has(key)) {
    keyLocks.set(key, new Mutex());
  }
  return keyLocks.get(key);
}


const server = net.createServer(async (socket) => {
  socket.on("data", async (data) => {
    console.log(`Received data: ${data}`);
    // First split to separate the ID from the rest of the command
    const [id, command, key, ...valueParts] = data.toString().trim().split(" ");
    const value = valueParts.join(" "); // Re-join the remaining parts for the value

    switch (command) {
      case "SET":
        try {
          const lock = getLockForKey(key);
          const release = await lock.acquire();
          try {
            dataStore[key] = value;
            console.log(`Adding ${key} with ID ${id} to the data store`);
            // Include the ID in the response
            socket.write(`${id} OK\n`);
          } finally {
            console.log(`Releasing lock for ${key}`);
            release();
          }
        } catch (error) {
          console.error("Error handling SET command:", error);
          // Include the ID in the error response
          socket.write(`${id} ERROR\n`);
        }
        break;
      case "GET":
        try {
          const lock = getLockForKey(key);
          console.log(`Getting ${key} for ${id} from the data store`);
          const release = await lock.acquire();
          try {
            const storedValue = dataStore[key] || "NOT FOUND";
            console.log(`Retrieved ${key} with ID ${id} from the data store`);
            // Include the ID in the response
            socket.write(`${id} OK ${storedValue}\n`);
          } finally {
            release();
          }
        } catch (error) {
          console.error("Error handling GET command:", error);
          // Include the ID in the error response
          socket.write(`${id} ERROR\n`);
        }
        break;
      default:
        // Include the ID in the unknown command response
        socket.write(`${id} Unknown command ${command}\n`);
    }
  });
});

const PORT = 7070;
server.listen(PORT, () => {
  console.log(`Cache server running on port ${PORT}`);
});
