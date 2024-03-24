const net = require('net');
const client = net.createConnection({port: 7000}, () => {
  console.log('Connected to server');
  client.write('Greetings from the TCP client.  Hello Server!\n');
});

client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});

client.on('end', () => {
  console.log('Disconnected from server');
});

client.on('error', (err) => {
  console.error(err);
});
