const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.send('1234567890', 0, 8, 41234, '0.0.0.0', (a, b) => {
    console.log(a, b);
});