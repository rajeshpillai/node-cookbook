const net = require('net');

class CacheClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    // Use async keyword to denote an asynchronous function
    async connect() {
        return new Promise((resolve, reject) => {
            this.client = net.createConnection({ host: this.host, port: this.port }, resolve);
            this.client.on('error', reject);
        });
    }

    // Mark sendCommand as async and utilize await within
    async sendCommand(command) {
        return new Promise((resolve, reject) => {
            this.client.once('data', (data) => {
                resolve(data.toString().trim());
            });

            this.client.write(`${command}\r\n`);
        });
    }

    // The method for converting input to string doesn't need to be async as it's a synchronous operation
    #convertInputToString(input) {
        if (Array.isArray(input)) {
            return JSON.stringify(input);
        } else if (typeof input === 'object' && input !== null) {
            return JSON.stringify(input);
        } else {
            return input.toString();
        }
    }

    // Utilize async/await for set, get, and del methods if needed
    async set(key, value) {
        const safeValue = this.#convertInputToString(value);
        return await this.sendCommand(`SET ${key} ${safeValue}`);
    }

    async get(key) {
        return await this.sendCommand(`GET ${key}`);
    }

    async del(key) {
        return await this.sendCommand(`DEL ${key}`);
    }

    close() {
        this.client.end();
    }
}

module.exports = CacheClient;
