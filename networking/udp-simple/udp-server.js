const dgram = require('dgram');
const server = dgram.createSocket('udp4'); 
const PORT = 7001;
server.on('error', (err) => {
  console.log(`Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`Server received: ${msg} from ${rinfo.address}: ${rinfo.port}`);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening ${address.address}: ${address.port}`);
});

server.bind(PORT);
