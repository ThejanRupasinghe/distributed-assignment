const net = require('net');
const logger = require('./logger');

let client = null;

module.exports.init = (ip, port, cb) => {
    client = new net.Socket();

    client.connect(port, ip, () => {
        logger.wire("TCP : Connected to", ip, ":", port);
    });

    client.on('close', () => {
        logger.wire('TCP : Connection closed -', ip, ":", port);
    });

    client.on('error', (error) => {
        logger.wire("TCP : ERROR :", error, "-", ip, ":", port);
        cb(error);
    });
};

module.exports.sendMessage = (message, cb) => {
    client.write(message);

    logger.wire("TCP : Sent - " + message);

    client.on('data', (data) => {
        logger.wire('TCP : Received - ' + data);
        if (cb) cb(data);
        client.destroy(); // kill client after server's response
    });
};

