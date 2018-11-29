const net = require('net');
const logger = require('./logger');
const results = require('./results-collector');

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
    results.plusTcpSentMsg();

    client.on('data', (data) => {
        logger.wire('TCP : Received - ' + data);
        results.plusTcpReceivedMsg();
        if (cb) cb(data.toString());
        client.destroy(); // kill client after server's response
    });
};

