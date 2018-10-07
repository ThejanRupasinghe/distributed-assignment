const log = require('./logger');
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

module.exports.send = (url, type, data, next) => {
    data['type'] = type;
    let queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
    log.info(ptcl + url + '/msg?' + queryString);

    const addressPort = url.split(':');
    // request({method: 'GET', url: ptcl + url + '/msg?' + queryString}, next);
    // send udp packet
    server.send(queryString, 0, queryString.length, addressPort[1], addressPort[0], () => {
        server.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            server.close();
        });

        server.on('message', (msg, rinfo) => {
            console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
            server.close();
            // create response
        });

        server.on('listening', () => {
            const address = server.address();
            console.log(`server listening ${address.address}:${address.port}`);
        });

        server.bind(41234);
    });
};

