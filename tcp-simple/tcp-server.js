const net = require('net');
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

server.listen(7000, () => {
  console.log('Server listening on port 7000');
});



