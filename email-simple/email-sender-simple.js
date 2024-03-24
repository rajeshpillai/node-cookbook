const net = require('net');
const tls = require('tls');

// Define your SMTP server details

const smtpHost = 'smtp.mail.yahoo.com';
const smtpPort = 587; // Default SMTP port for TLS

const username = Buffer.from("devbootcamp24x7@yahoo.com", 'utf8').toString('base64');
const password = Buffer.from("uuiznvqfwhiiqrjy", 'utf8').toString('base64');

// Create a socket connection to the SMTP server
const client = net.createConnection(smtpPort, smtpHost);

const secure = true;

client.on('connect', () => {
  console.log('Connected to SMTP server');

  // Send initial greeting to the server
  client.write('EHLO example.com\r\n');
});

client.on('data', (data) => {
  const response = data.toString();
  console.log('Server response:', response);

  // Check if the server supports STARTTLS
  if (response.startsWith('220') && secure) {
    console.log('Server supports STARTTLS');
    client.write('STARTTLS\r\n');
  } else if (response.startsWith('220') || response.includes('250 STARTTLS')) {
    console.log("UPGRADING TO TLS...");
    const secureSocket = tls.connect({
      socket: client,
      rejectUnauthorized: false
    }, () => {
      console.log("Connection secured");
      secureSocket.write("EHLO localhost\r\n");
      secureSocket.write("AUTH LOGIN\r\n");
    }) ;

    secureSocket.on("error",(err) => {
      console.error('ERROR:', err);
    });
    
  }
  
  //if (response.includes('STARTTLS')) {
  //   // Request TLS encryption
  //   client.write('STARTTLS\r\n');
  // } else {
  //   console.log('SMTP server does not support STARTTLS');
  //   client.end();
  // }
});

client.on('secureConnect', () => {
  console.log('TLS connection established');

  // Authenticate and send email commands
  client.write('AUTH LOGIN\r\n'); // You'll need to provide base64-encoded username and password

  client.write(`${username}\r\n`);
  client.write(`${password}\r\n`);
  client.write('MAIL FROM: <devbootcamp24x7@yahoo.com>\r\n');
  client.write('RCPT TO: <sociallogin76@gmail.com>\r\n');
  client.write('DATA\r\n');
  client.write('Subject: Hello from Node.js\r\n');
  client.write('This is the email body.\r\n');
  client.write('.\r\n'); // End the email
  client.write('QUIT\r\n'); // Close the connection
});

client.on('end', () => {
  console.log('Disconnected from SMTP server');
});

client.on('error', (err) => {
  console.error('Error:', err);
});