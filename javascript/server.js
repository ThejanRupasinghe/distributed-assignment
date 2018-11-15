const random = require('./lib/random');
const cli = require('./lib/cli');
const logger = require('./lib/logger');
const minimist = require('minimist');
const tcp = require('./lib/tcp-message');
const udp = require('./lib/udp-message');
const ipLib = require('ip');
const msgParser = require('./lib/message-parser');

const HEART_BEAT_TIME_OUT = 5000; // 5 seconds;

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
logger.print("=========== ", myNode.name , ' ==============');
logger.info("Node : Node Starting....");
logger.info("Node : My Node : ", myNode);
logger.info("Node : Bootstrap Server : ", bsNode);

// initial join to from bootstrap server
if (bsNode) {

    // initialize tcp connection to BS
    tcp.init(bsNode.ip, bsNode.port, (error) => {
        if (error != null) {
            shutdown(1);
        }
    });

    // takes register message
    let regMsg = msgParser.generateREG(myNode);

    tcp.sendMessage(regMsg, (receiveMsg) => {
        msgParser.parseREGOK(receiveMsg.toString(), (nodes, noOfNodes, error) => {
            if (nodes != null) {
                if (noOfNodes === 0) {
                    logger.info("Node : Registration successful. No nodes registered in the system.");
                    start();
                } else {
                    logger.info("Node : Request is successful. Returning " + noOfNodes + " nodes.");

                    logger.info("Node : Node List -", nodes);

                    start();

                    if (noOfNodes >= 4) {
                        nodes = random.selectRandom(1, nodes);
                    }

                    Object.keys(nodes).forEach(k => {
                        let node = nodes[k];
                        udp.send(node, {type: msgParser.JOIN, node: myNode}, (res, err) => {
                            if (err === null) {
                                if (res.body.success) {
                                    routingTable[k] = node;
                                    logger.info("Node : Added to routing table - " + node.ip + ":" + node.port);
                                } else {
                                    logger.error("Node : Error in joining, Node - " + node.ip + ":" + node.port);
                                }
                            }
                        });
                    });
                }

                // NOTE: check all node after 5 second
                heartBeatAndDiscover();

            } else {
                switch (error) {
                    case 9999:
                        logger.error("Node : Registration failed. Entry already in the table.");
                        shutdown();
                        break;
                    case 9998:
                        logger.error("Node : Registration failed. Invalid IP, Port or Username.");
                        shutdown();
                        break;
                    case 9997:
                        logger.error("Node : Registration failed. Bootstrap table is full.");
                        shutdown();
                        break;
                    case "ERROR":
                        logger.error("Node : Invalid Registration Command.");
                        shutdown();
                        break;
                }
            }
        });
    });

}


// ============= Check the liveness by heartbeat request and fill the routing table up to 4 entries
function heartBeatAndDiscover() {
    setInterval(() => {
        // send live request to all nodes
        Object.keys(routingTable).forEach(nodeKey => {
            let node = routingTable[nodeKey];
            udp.send(node, {type: msgParser.LIVE, node: myNode}, (res, err) => {
                if(err !== null) {
                    // This is failed
                    logger.error(nodeKey, ' is dead');
                    delete routingTable[nodeKey];  // remove from my routing table

                    // inform to bootstrap server
                    let unregMsg = msgParser.generateUNREG({
                        ip: node.ip, port: node.port, name: nodeKey
                    });
                    tcp.init(bsNode.ip, bsNode.port, (error) => {
                        console.log(error);
                    });
                    tcp.sendMessage(unregMsg, (receivedMsg) => {
                        logger.ok('Inform to Bootstrap server about the missing');
                    })
                } else {
                    logger.ok(nodeKey, ' is LIVE')
                }
            });
        });

        // check the routing table entry count and try to discover more
        if(Object.keys(routingTable).length < 4) {
            // discover
            logger.warning('Not enough nodes in routing table. try to discover');
            let discSendNode = random.pickOne(routingTable);
            udp.send(discSendNode, {type: msgParser.DESC, node: myNode}, (res,err) => {
                // connect here
                udp.send(res.body.node, {type: msgParser.JOIN, node: myNode}, (res1, err) => {
                    if (err === null) {
                        let node = res1.body.node;
                        if (res1.body.success) {
                            routingTable[res.body.node.name] = node;
                            logger.info("Node : Added to routing table - " + node.ip + ":" + node.port);
                        } else {
                            logger.error("Node : Error in joining, Node - " + node.ip + ":" + node.port);
                        }
                    }
                });
            });
        }
    }, HEART_BEAT_TIME_OUT);
}

// TODO: implement shutdown gracefully and trigger hook
function shutdown(error) {
    process.exit(error);
}

function start() {
    udpStart();
    cliStart();
}

// message handler
function udpStart() {
    udp.init(myNode.port, (req, res) => {
        let body = req.body;
        // logger.info('- incoming message', JSON.stringify(body));
        switch (body['type']) {
            case 'ping':
                break;
            case 'pong':
                break;
            case msgParser.JOIN: // name, address
                routingTable[body.node.name] = {
                    ip: body.node.ip,
                    port: body.node.port
                };
                logger.info("Node : Added to routing table - " + body.node.ip + ":" + body.node.port);
                // TODO: can handle routing table exceeding - success: false
                res.send({type: msgParser.JOIN_OK, success: true});
                break;
            case msgParser.LIVE:
                res.send({type: msgParser.LIVE_OK, success: true});
                break;
            case msgParser.DESC:
                // pick a random node from my routing table and send
                let pickedOne = random.pickOne(routingTable);
                res.send({type: msgParser.DESC_OK, node: pickedOne, success: true});
                break;
            case 'send-msg': // not reliable
                require('./functions/send-msg').serverHandle(req, res, routingTable, name);
                break;
            case 'send-msg-rel': // reliable

                break;
            case 'con-graph':
                require('./functions/con-graph').serverHandle(req, res, routingTable, name);
                break;
            case 'delete':
                if (routingTable[msg.name]) {
                    delete routingTable[msg.name];
                }
                res.end();
                break;
            case 'force-delete':
                // call exit
                break;
        }
    });
}

// CLI
function cliStart() {
    cli.init({
        'send-msg': (params) => { // (target, msg, ttl) not reliable
            require('./functions/send-msg').cli(params, routingTable, myNode.name);
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
}