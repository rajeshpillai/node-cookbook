require('dotenv').config();
const EmailSender = require("./email-sender");

const server = process.env.SMTP_SERVER;
const port = process.env.SMTP_PORT;
const secure = process.env.SMTP_SECURE;
const from = process.env.FROM_EMAIL;
const password = process.env.EMAIL_PASSWORD;


const sender = new EmailSender(server, port, secure);

const email = from;

const to = "sociallogin76@gmail.com";
const subject = "Test Email from nodejs network tutorial";
const message = "This is a test mail without using any node.js external libraries";

sender.send(email, password, from, to, subject, message) 
  .then(result => console.log(result)) 
  .catch(error => console.error("Failed to send email: ", error));

