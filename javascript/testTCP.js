const tcp = require('./lib/tcp-message');
const logger = require('./lib/logger');
const net = require('net');
const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');

let bsAddress = {
    ip: '0.0.0.0',
    port: 5051
};

tcp.init(bsAddress.ip, bsAddress.port);

tcp.sendMessage("0034 REG 129.82.123.45 5001 432cd", (data)=>{
    logger.info(data);
});

// let response = "0051 REGOK 2 129.82.123.45 5001 abcd1234 64.12.123.190 34001 abcd5678";
//
// let responseArr = response.split(" ");
//
// let status = responseArr[1];
// console.log(status);
//
// let noOfNodes = responseArr[2];
//
// let body = {};
//
// for (let i = 3; i <= noOfNodes * 3; i += 3) {
//     let userName = responseArr[i + 2];
//     let node = {
//         ipAddr: responseArr[i],
//         port: parseInt(responseArr[i + 1]),
//     };
//
//     body[userName] = node;
// }
//
// console.log(body);
