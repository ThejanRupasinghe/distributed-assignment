const dgram = require('dgram');

// server function
module.exports.server = (port, cb) => {
    const server = dgram.createSocket('udp4'); // create server instance

    server.on('message', (msgStream, rinfo) => { // create event on message (fire when packet arrives)
        const udpStream = JSON.parse(msgStream.toString());       // parse the message

        if(udpStream.type === 'REQ') { // server responds only for requests.
            // send ACK
            const ack = JSON.stringify({type: 'ACK', ok: 1, id: udpStream.id}); // create the acknowledgement
            server.send(ack, 0, ack.length, rinfo.port, rinfo.address);     // send ack

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
                    server.send(resString, 0, resString.length, rinfo.port, rinfo.address);
                }
            };
            // call the call back with request and response object.
            cb(request, response);
        }
    });

    // listing event
    server.on('listening', () => {
        console.log('server is listening on ', port);
    });

    // start listing to the port
    server.bind(port);
};

// url, type, data, next
module.exports.send = (target, data,  cb) => { // cb(err, response, body)
    const server = dgram.createSocket('udp4');  // create server instance
    server.status = false;  // status of the server.

    const msgId = Math.random().toString().substr(2); // generate a unique random number
    let version = 0; // message version

    const fn = () => {
        version += 1; // increase message version
        if (version > 5) { // message limit
            // if exceed the limit, close the server. clear the interval, return an error TIMEOUT
            if(server.status) server.close();
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
        // console.log('==========, address', msg_send, 0, msg_send.length, target, '127.0.0.1');
        server.send(msg_send, 0, msg_send.length, target.port, target.address, (a, b) => {

            server.status = true;
            // listen for getting response.
            let timeoutRef;
            server.on('message', (msg_response, rinfo) => {
                msg_response = JSON.parse(msg_response); // take the response
                if (msg_response && msg_response.id === msgId) { // ensure it is for the sent request
                    if (msg_response.type === 'ACK' && msg_response.ok) { // ack
                        clearTimeout(timeoutRef); // clear intervals
                    } else if (msg_response.type === 'RES') { // response
                        clearTimeout(timeoutRef); // clear intervals, stop server and then return the response
                        server.close();
                        return cb(null, msg_response, msg_response.body);
                    }
                }
            });
            timeoutRef = setTimeout(() => {
                return fn();
            }, 1000);
        });
    };

    // put an interval to send the message until get an acknowledgement
    // const sendMsgCaller = setInterval(fn, 1000); // interval for trying requests
    fn();
};
//
// if (process.argv[2] === '1') {
//     console.log('Server UP');
//     module.exports.server(41526, (req, res) => {
//         console.log('req', req);
//         console.log('res', res);
//         console.log('send the response');
//         setTimeout(() => {
//             res.jsonp({this: 'This is your response'});
//         }, 2500);
//     });
// } else {
//     console.log('Client UP');
//     module.exports.send(41526,'test',{message: 'Hi all'}, (err, res, body) => {
//         console.log('err -----', err);
//         console.log('res', res);
//         console.log('body', body);
//     });
// }
