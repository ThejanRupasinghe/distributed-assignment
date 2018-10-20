const net = require('net');
const logger = require('./logger');

var client = null;

module.exports.init = (ip, port, cb) => {
    client = new net.Socket();

    client.connect(port, ip, () => {
        logger.info("TCP : Connected to", ip, ":", port);
    });

    client.on('close', function () {
        logger.info('TCP : Connection closed -', ip, ":", port);
    });

    client.on('error', (error) => {
        logger.error("TCP : ERROR :", error, "-", ip, ":", port);
        cb(error);
    });
};

module.exports.sendMessage = (message, cb) => {
    client.write(message);

    logger.info("TCP : Sent - " + message);

    client.on('data', function (data) {
        logger.info('TCP : Received - ' + data);
        if (cb) cb(data);
        client.destroy(); // kill client after server's response
    });
};

