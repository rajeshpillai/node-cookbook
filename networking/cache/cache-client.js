const net = require('net');

class CacheClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client = net.createConnection({ host: this.host, port: this.port }, () => {
                resolve();
            });

            this.client.on('error', (err) => {
                reject(err);
            });
        });
    }

    sendCommand(command) {
        return new Promise((resolve, reject) => {
            this.client.once('data', (data) => {
                resolve(data.toString().trim());
            });

            this.client.write(`${command}\r\n`);
        });
    }

    #convertInputToString(input) {
      if (Array.isArray(input)) {
        return input;
      } else if (typeof input === 'object' && input !== null) {
          return JSON.stringify(input);
      } else {
          return typeof input;
      }
    }
    set(key, value) {
      const safe_value = this.#convertInputToString(value);
      return this.sendCommand(`SET ${key} ${safe_value}`);
    }

    get(key) {
        return this.sendCommand(`GET ${key}`);
    }

    del(key) {
        return this.sendCommand(`DEL ${key}`);
    }

    close() {
        this.client.end();
    }
}

module.exports = CacheClient;
