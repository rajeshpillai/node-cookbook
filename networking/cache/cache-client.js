const net = require('net');
const {v4: uuidv4} = require('uuid');

class CacheClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.pendingCommands = new Map(); // Stores pending commands with a unique ID
        this.currentId = 0; // Unique ID for each command
    }

    // Connect and setup a persistent data listener
    async connect() {
        return new Promise((resolve, reject) => {
            this.client = net.createConnection({ host: this.host, port: this.port }, resolve);
            this.client.on('error', reject);

            // Persistent listener for data events
            this.client.on('data', (dataBuffer) => {
                console.log(`Received data: ${dataBuffer.toString()}`);
                // Simple example assuming responses end with newline characters
                const responses = dataBuffer.toString().trim().split('\n');
                for (const response of responses) {
                    const [id, status, ...responseDataParts] = response.split(' ');
                    const responseData = responseDataParts.join(' ');
                    console.log(`Received response for ID ${id}: ${status} - ${responseData}`);
                    if (this.pendingCommands.has(id)) {
                        const { resolve, reject } = this.pendingCommands.get(id);
                        if (status === 'OK') {
                            console.log("RESOLVED");
                            resolve(responseData);
                        } else {
                            console.log("REJECTED");
                            reject(new Error(`Command failed with status: ${status} for ID ${id}: ${responseData}`));
                        }
                        this.pendingCommands.delete(id);
                    } else {
                        console.error(`No pending command found for ID ${id}`);
                    }
                }
                console.log("One cycle done...");
            });
        });
    }

    // Modified sendCommand to include an ID for correlating requests and responses
    async sendCommand(command) {
        const id = uuidv4(); // this.currentId++;
        const commandWithId = `${id} ${command}`; // Prepend the ID to the command

        return new Promise((resolve, reject) => {
            this.pendingCommands.set(id.toString(), { resolve, reject });
            console.log(`Sending command:  ${commandWithId}`)
            this.client.write(`${commandWithId}\r\n`);
        });
    }

    #convertInputToString(input) {
        if (Array.isArray(input) || (typeof input === 'object' && input !== null)) {
            return JSON.stringify(input);
        } else {
            return input.toString();
        }
    }

    async set(key, value) {
        const safeValue =  this.#convertInputToString(value);
        return await this.sendCommand(`SET ${key} ${safeValue}`);
    }

    async get(key) {
        return this.sendCommand(`GET ${key}`);
    }

    async del(key) {
        return this.sendCommand(`DEL ${key}`);
    }

    close() {
        this.client.end();
    }
}

module.exports = CacheClient;
