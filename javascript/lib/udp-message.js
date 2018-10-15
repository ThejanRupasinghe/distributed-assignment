const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');

udpServer.on('listening', () => {
    console.log('UDP server is listing...');
});

const responseHandlersMap = {};

module.exports.init = (port, cb) => {
    udpServer.bind(port);

    udpServer.on('message', (msgStream, rinfo) => {
        const udpStream = JSON.parse(msgStream.toString());       // parse the message

        let resHandler = responseHandlersMap[udpStream.id];

        if (udpStream.type === 'REQ') { // create req, res object to pass handler.
            // send ACK
            const ack = JSON.stringify({type: 'ACK', ok: 1, id: udpStream.id}); // create the acknowledgement
            udpServer.send(ack, 0, ack.length, rinfo.port, rinfo.address);     // send ack

            const request = {  // create request object
                body: udpStream.body,
                rinfo: rinfo
            };
            const response = { // response object
                jsonp: (data) => { // this is the function that sends the response
                    // create the response string with the results data
                    const resString = JSON.stringify({
                        body: data,
                        id: udpStream.id,
                        type: 'RES'
                    });
                    // send the results TODO add ack if necessary (then the version will be added)
                    udpServer.send(resString, 0, resString.length, rinfo.port, rinfo.address);
                }
            };


            // call the call back with request and response object.
            if (cb) cb(request, response);
        } else if (udpStream.type === 'ACK') {
            if(resHandler) {
                resHandler.ack = true;
                resHandler.stopSending();
            }
        } else if (udpStream.type === 'RES') {
            if(resHandler && !resHandler.done) {
                resHandler.stopSending();
                resHandler.done = true; // not call the response handler two time
                resHandler.handler(null, udpStream, udpStream.body);
            }
        }
    });
};


module.exports.send = (target, data, cb) => {
    const msgId = Math.random().toString().substr(2); // generate a unique random number
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
            type: 'REQ'
        };
        msg_send = JSON.stringify(msg_send);

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
            }, 500);
        });
    };

    // put an interval to send the message until get an acknowledgement
    fn();
};
