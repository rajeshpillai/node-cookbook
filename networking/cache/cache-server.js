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
    const [command, key, ...valueParts] = data.toString().trim().split(" ");
    const value = valueParts.join(" "); // Re-join the remaining parts for the value

    switch (command) {
      case "SET":
        try {
          const lock = getLockForKey(key);
          const release = await lock.acquire();
          try {
            dataStore[key] = value;
            socket.write("OK\n");
          } finally {
            release();
          }
        } catch (error) {
          console.error("Error handling SET command:", error);
          socket.write("ERROR\n");
        }
        break;
      case "GET":
        try {
          const lock = getLockForKey(key);
          const release = await lock.acquire();
          try {
            const storedValue = dataStore[key] || "NOT FOUND";
            socket.write(`${storedValue}\n`);
          } finally {
            release();
          }
        } catch (error) {
          console.error("Error handling GET command:", error);
          socket.write("ERROR\n");
        }
        break;
      default:
        socket.write("Unknown command\n");
    }
  });
});

const PORT = 7070;
server.listen(PORT, () => {
  console.log(`Cache server running on port ${PORT}`);
});
