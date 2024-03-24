const net = require("net");
const tls = require("tls");

class EmailSender {
  constructor(server, port, secure = false) {
    this.server = server;
    this.port = port;
    this.secure = secure;  // Whether to use STARTTLS
  }

  send(email, password, from, to, subject, message) {
    return new Promise((resolve, reject) => {
      const client = net.createConnection({port: this.port, host: this.server});
        
      client.on('connect', () => {
        console.log('Connected to SMTP server');
        client.write('EHLO localhost\r\n');
      });

      client.on('data', (data) => {
        const response = data.toString();
        console.log('Server response: ', response);
        if (response.startsWith('220') && this.secure) {
          client.write('STARTTLS\r\n');
        } else if (response.startsWith('220') || response.includes('250 STARTTLS')) {
          console.log("UPGRADING TO TLS...");
          this.upgradeToSecure(client, email, password, from, to, subject, message, resolve, reject);
        } else if (response.startsWith('235')) {
          this.sendEmail(client, from, to, subject, message, resolve);
        }
      });

      client.on('error', (err) => {
        reject(err);
      });

    });
  }


  upgradeToSecure(client, email, password, from, to, subject, message, resolve, reject) {
   const secureSocket = tls.connect({
      socket: client,
      rejectUnauthorized: true
   }, () => {
    console.log("Connection secured");
    secureSocket.write("EHLO localhost\r\n");
    secureSocket.write("AUTH LOGIN\r\n");
   }) ;

   secureSocket.on("data", (data) => {
    const response = data.toString();
    console.log("Secure server response: ", response);
    if (response.includes('334 VXNlcm5hbWU6')) { // Username prompt
      secureSocket.write(Buffer.from(email).toString('base64') + "\r\n");
    } else if (response.includes("334 UGFzc3dvcmQ6"))  {  // Password prompt
        secureSocket.write(Buffer.from(password).toString("base64") + "\r\n");
    } else if (response.startsWith("235")) {
      this.sendEmail(secureSocket, from, to, subject, message, resolve);
    }
   });
   secureSocket.on("error", (err) => {
    console.log("TLS upgrade error: ", err);
    reject(err);
   })
  }

  sendEmail(client, from, to, subject, message, resolve) {
    client.write(`MAIL FROM:<${from}>\r\n`);
    clinet.on("data", (data) => {
      const response = data.toString();
      console.log("SERVER RESPONSE: ", response);
      if (response.startsWith("250")) {
        client.write(`RCPT TO:<${to}\r\n`);
      } else if (response.includes("250 OK")) {
        client.write("DATA\r\n");
      } else if (response.startsWith("354")) {
        const fullMessage = `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\n\n${message}\r\n.\r\n`;
        client.writeMessage(fullMessage);
      } else if (response.includes("250 Queued")) {
        console.log("Messge sent");
        client.write("QUIT\r\n");
        resolve("Email sent successfully");
      }
    });
  }
}

module.exports = EmailSender;