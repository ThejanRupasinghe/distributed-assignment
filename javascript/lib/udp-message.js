const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');
const msgParser = require('./message-parser');
const logger = require('./logger');
const uuid = require('uuid/v1');
const results = require('./results-collector');

let requestLatency = 500;
let exponential = 0;

udpServer.on('listening', () => {
    logger.info("UDP : UDP Server is listening.....");
});

const responseHandlersMap = {};

module.exports.init = (port, reqLate, exp, cb) => {
    requestLatency = reqLate;
    exponential = exp;
    udpServer.bind(port);

    udpServer.on('message', (msgStream, rinfo) => {
        logger.wire("UDP : Received - " + msgStream.toString() + " - " + rinfo.address + ":" + rinfo.port);
        results.plusUdpReceivedMsg();

        const udpStream = msgParser.parseUDPMsg(msgStream.toString(), rinfo);

        let resHandler = responseHandlersMap[udpStream.id];

        if (udpStream.type === msgParser.REQ) { // create req, res object to pass handler.
            // send ACK
            const ack = msgParser.generateUDPMsg({body: {type: msgParser.ACK, ok: 1}, id: udpStream.id}); // create the acknowledgement
            udpServer.send(ack, 0, ack.length, rinfo.port, rinfo.address);     // send ack
            logger.wire("UDP : Sent - " + ack + " - " + rinfo.address + ":" + rinfo.port);
            results.plusUdpSentMsg();

            const request = {  // create request object
                body: udpStream.body,
                rinfo: rinfo
            };

            const response = { // response object
                send: (data) => { // this is the function that sends the response
                    // create the response string with the results data
                    const resString = msgParser.generateUDPMsg({
                        body: data,
                        id: udpStream.id,
                        type: msgParser.RES
                    });
                    // send the results TODO add ack if necessary (then the version will be added)
                    udpServer.send(resString, 0, resString.length, rinfo.port, rinfo.address);
                    logger.wire("UDP : Sent - " + resString + " - " + rinfo.address + ":" + rinfo.port);
                    results.plusUdpSentMsg();
                }
            };

            // call the call back with request and response object.
            if (cb) cb(request, response);

        } else if (udpStream.type === msgParser.ACK) {
            if (resHandler) {
                resHandler.ack = true;
                resHandler.stopSending();
            }
        } else if (udpStream.type === msgParser.RES) {
            if (resHandler && !resHandler.done) {
                resHandler.stopSending();
                resHandler.done = true; // not call the response handler two time
                resHandler.handler(udpStream, null);
            }
        }
    });
};


module.exports.send = (target, data, cb) => {
    const msgId = uuid().split("-")[0]; // generate a unique random number
    let version = 0; // message version

    const fn = () => {
        version += 1; // increase message version
        if (version > 5) { // message limit
            return cb({error: 'TIMEOUT'});
        }
        // message Object
        let msg_send = {
            id: msgId,
            version: version,
            body: data,
            type: msgParser.REQ
        };
        // msg_send = JSON.stringify(msg_send);
        msg_send = msgParser.generateUDPMsg(msg_send);

        // send the message
        udpServer.send(msg_send, 0, msg_send.length, target.port, target.ip, (a, b) => {
            let timeoutRef;
            // append a response handler object to the map
            responseHandlersMap[msgId] = {
                handler: cb,
                ack: false,
                done: false,
                stopSending: () => {
                    clearTimeout(timeoutRef);
                }
            };
            timeoutRef = setTimeout(() => {
                return fn();
            }, requestLatency * Math.pow(version, exponential));
        });

        logger.wire("UDP : Sent - " + msg_send + " - " + target.ip + ":" + target.port);
        results.plusUdpSentMsg();
    };

    // put an interval to send the message until get an acknowledgement
    fn();
};
