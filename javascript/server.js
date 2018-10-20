const random = require('./lib/random');
const cli = require('./lib/cli');
const logger = require('./lib/logger');
const minimist = require('minimist');
const tcp = require('./lib/tcp-message');
const udp = require('./lib/udp-message');
const ipLib = require('ip');
const msgParser = require('./lib/message-parser');

// stores local ip and default port, later adds name
let myNode = {
    ip: ipLib.address(),
    port: 4000,
    name: 'node_' + ipLib.address()
};

// routing table
const routingTable = {};

// stores bootstrap server ip and port
let bsNode;

// take command line arguments (port, bs)
let argv = minimist(process.argv.slice(2));

// init according to argv
if (argv.port) {
    myNode.port = argv.port;
}
if (argv.name) {
    myNode.name = argv.name;
}

if (argv.bsIP && argv.bsPort) {
    bsNode = {};
    bsNode.ip = argv.bsIP;
    bsNode.port = argv.bsPort;
}

// print out taken information
logger.info("Node : Node Starting....");
logger.info("Node : My Node : ", myNode);
logger.info("Node : Bootstrap Server : ", bsNode);

// initial join to from bootstrap server
if (bsNode) {

    // initialize tcp connection to BS
    tcp.init(bsNode.ip, bsNode.port);

    // takes register message
    let regMsg = msgParser.generateREG(myNode);

    tcp.sendMessage(regMsg, (receiveMsg) => {
        msgParser.parseREGOK(receiveMsg.toString(), (nodes, error) => {
            if (nodes != null) {
                if (Object.keys(nodes).length === 0) {
                    logger.info("Node : Registration successful. No nodes registered in the system.");
                } else {
                    logger.info("Node : Request is successful. Returning " + Object.keys(nodes).length + " nodes.");

                    logger.info("Node : Node List -" , nodes);

                    Object.keys(nodes).forEach(k => {
                        udp.send(nodes[k], {type: 'join', name: name, address: myNode}, (err, res, body1) => {
                            body1 = JSON.parse(body1);
                            if (body1['success']) {
                                routingTable[k] = nodes[k];
                            } else {
                                logger.error('error');
                            }
                        });
                    })
                }

            } else {
                switch (error) {
                    case 9999:
                        logger.error("Node : Registration failed. Entry already in the table.");
                        break;
                    case 9998:
                        logger.error("Node : Registration failed. Invalid IP, Port or Username.");
                        break;
                    case 9997:
                        logger.error("Node : Registration failed. Bootstrap table is full.");
                        break;
                    case "ERROR":
                        logger.error("Node : Invalid Registration Command.");
                        break;
                }
            }
        });
    });

    // udp.send(bs, {type: 'bs', name: name, address: myNode}, (err, res, body) => {
    //     // give warning if there is any conflicts in current and received addresses.
    //     logger.info('[body]', body);
    //     // body = JSON.parse(body);
    //     if (body) {
    //
    //     }
    // });
}


// message handler
// udp.init(myNode.port, (req, res) => {
//     let body = req.body;
//     logger.info('- incoming message', JSON.stringify(body));
//     switch (body['type']) {
//         case 'ping':
//             break;
//         case 'pong':
//             break;
//         case 'join': // name, address
//             // log.info('Join - ', body['name'], body['address']);
//             routingTable[body['name']] = body['address'];
//             res.jsonp({success: true});
//             break;
//         case 'send-msg': // not reliable
//             require('./functions/send-msg').serverHandle(req, res, routingTable, name);
//             break;
//         case 'send-msg-rel': // reliable
//
//             break;
//         case 'con-graph':
//             require('./functions/con-graph').serverHandle(req, res, routingTable, name);
//             break;
//         case 'delete':
//             if (routingTable[msg.name]) {
//                 delete routingTable[msg.name];
//             }
//             res.end();
//             break;
//         case 'force-delete':
//             // call exit
//             break;
//     }
// });

// CLI
cli.init({
    'send-msg': (params) => { // (target, msg, ttl) not reliable
        require('./functions/send-msg').cli(params, routingTable, name);
    },
    'send-msg-rel': (params) => { // reliable (target, msg, ttl)

    },
    'con-graph': (params) => { // ttl,
        require('./functions/con-graph').cli(params, routingTable)
    },
    'delete': () => {
        let count = 0;
        Object.keys(routingTable).forEach(k => {
            udp.send(routingTable[k], 'delete', {name: name}, () => {
                count += 1;
                if (count === Object.keys(routingTable).length) {
                    process.exit();
                }
            });
        });
    },
    'at': () => {
        logger.print('your address table: ');
        Object.keys(routingTable).forEach(a => {
            logger.print('\t', a, ": ", routingTable[a]);
        })
    },
    'name': () => {
        logger.print(name);
    }
});