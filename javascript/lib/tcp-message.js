const net = require('net');
const logger = require('./logger');

var client = null;

module.exports.init = (ip, port, cb) => {
    client = new net.Socket();

    client.connect(port, ip, ()=>{
        logger.info("Connected to ", ip ," : ", port);
    });

    client.on('close', function() {
        console.log('Connection closed');
    });

    client.on('error', (error)=>{
        logger.error("ERROR : ", error);
    });
};

module.exports.sendMessage = (message, cb) => {
    client.write(message);

    client.on('data', function(data) {
        logger.info('Received: ' + data);
        if(cb) cb(data);
        client.destroy(); // kill client after server's response
    });
};

