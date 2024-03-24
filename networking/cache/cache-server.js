const net = require("net");
const { Mutex} = require("async-mutex");

const data_store = {};
const data_locks = new Map();
const mutex = new Mutex() ;

let release = null;
const server = net.createServer(async(socket) => {
  socket.on("data", async (data) => { 
    const [command, key, ...value] = data.toString().trim().split(" ");
    switch (command) {
      case "SET":
        release = await mutex.acquire();
        console.log("CACHE SERVER: ", value);
        data_store[key] = value.join(" ");
        release();
        socket.write("OK\n");
        break;
      case "GET":
        release = await mutex.acquire();
        socket.write(`${data_store[key]}\n`);
        release();
        break;
      default:
        socket.write("Unknown command\n");
    }
  });
});
const PORT = 7070;
server.listen(7070, () => {
  console.log(`Cache srver running on port ${PORT}`);
});