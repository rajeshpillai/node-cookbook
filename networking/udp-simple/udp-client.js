const dgram = require('dgram');
const message = Buffer.from("Hello UDP server"); 
const client = dgram.createSocket("udp4");  // UDP socket for IPv4.

const SERVER_PORT = 7001;

client.send(message, SERVER_PORT, 'localhost', (err) => {
  client.close();
});