const net = require('net');
const SERVER_PORT = 7000;

const server = net.createServer((socket) => {
  console.log('Client connected...');
  socket.on('data', (data) => {
    console.log(`Data received from client: ${data.toString()}`);
  });
  socket.on('end', () => {
    console.log('Client disconnected...');
  });
  socket.write('Hello from TCp Server\n');
  socket.pipe(socket);
});

server.on('error', (err) => {
  throw err;
});

server.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});



