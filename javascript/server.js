const random = require('./lib/random');
const cli = require('./lib/cli');
const logger = require('./lib/logger');
const minimist = require('minimist');
const tcp = require('./lib/tcp-message');
const udp = require('./lib/udp-message');
const ipLib = require('ip');
const msgParser = require('./lib/message-parser');
const searchAlgo = require('./lib/search_algo');
const fileController = require('./lib/file-controller');
const MusicFile = require('./lib/music-file');

// server constants
const HEART_BEAT_TIME_OUT = 5000; // 5 seconds;
const MAX_FILES_PER_NODE = 5;
const MIN_FILES_PER_NODE = 3;
const MAX_FILE_SIZE = 10;
const MIN_FILE_SIZE = 2;

// stores local ip and default port, later adds name
let myNode = {
    ip: ipLib.address(),
    port: 4000,
    name: 'node_' + ipLib.address()
};

// to store music files for the node
let files = {};

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
logger.ok("=========== ", myNode.name, ' ==============');
logger.info("Node: Node Starting....");
logger.info("Node: My Node: ", myNode);
logger.info("Node: Bootstrap Server: ", bsNode);

// initial join to from bootstrap server
if (bsNode) {

    // initialize tcp connection to BS
    tcp.init(bsNode.ip, bsNode.port, (error) => {
        if (error != null) {
            logger.error("Node: Error connecting to Bootstrap Server");
            logger.error(error);
            shutdown(1);
        }
    });

    // takes register message
    let regMsg = msgParser.generateREG(myNode);

    tcp.sendMessage(regMsg, (receiveMsg) => {

        msgParser.parseREGOK(receiveMsg.toString(), (nodes, noOfNodes, error) => {
            if (nodes != null) {
                if (noOfNodes === 0) {
                    logger.info("Node: Registration successful. No nodes registered in the system.");
                    start();
                } else {
                    logger.info("Node: Request is successful. Returning " + noOfNodes + " nodes.");

                    logger.info("Node: Node List -", nodes);

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
                                    logger.info("Node: Added to routing table - " + node.ip + ":" + node.port);
                                } else {
                                    logger.error("Node: Error in joining, Node - " + node.ip + ":" + node.port);
                                }
                            }
                        });
                    });
                }

                // NOTE: check all nodes after 5 seconds
                heartBeatAndDiscover();

            } else {
                switch (error) {
                    case 9999:
                        logger.error("Node: Registration failed. Entry already in the table.");
                        break;
                    case 9998:
                        logger.error("Node: Registration failed. Invalid IP, Port or Username.");
                        break;
                    case 9997:
                        logger.error("Node: Registration failed. Bootstrap table is full.");
                        break;
                    case "ERROR":
                        logger.error("Node: Invalid Registration Command.");
                        break;
                }
                shutdown(1);
            }
        });
    });

}

/**
 * Checks the liveliness by heartbeat request and fill the routing table up to 4 entries
 */
function heartBeatAndDiscover() {
    setInterval(() => {
        // send live request to all nodes
        let iterCount = 0;
        Object.keys(routingTable).forEach(nodeKey => {
            iterCount++;
            let node = routingTable[nodeKey];
            udp.send(node, {type: msgParser.LIVE, node: myNode}, (res, err) => {
                if (err !== null) {
                    // This node has failed
                    logger.error("Node:", nodeKey, 'is dead');
                    delete routingTable[nodeKey];  // remove from my routing table

                    // inform bootstrap server
                    let unregMsg = msgParser.generateUNREG({
                        ip: node.ip, port: node.port, name: nodeKey
                    });
                    tcp.init(bsNode.ip, bsNode.port, (error) => {
                        logger.error(error);
                    });
                    tcp.sendMessage(unregMsg, (receivedMsg) => {
                        logger.ok('Node: Inform Bootstrap server about the missing node');
                    })
                } else {
                    logger.hb("Node:", nodeKey, 'is LIVE');
                }
            });
        });

        //TODO: discover only if LIVE
        // check the routing table entry count and try to discover more
        if ((Object.keys(routingTable).length) < 4 && (Object.keys(routingTable).length > 0)) {
            // discover
            logger.hb('Node: Not enough nodes in routing table. try to discover');
            discover();
        }
    }, HEART_BEAT_TIME_OUT);
}

/**
 * Does Node Discovery
 */
function discover() {
    let discSendNode = random.pickOne(routingTable);

    udp.send(discSendNode, {type: msgParser.DISC, node: myNode}, (res, err) => {
        // connect here
        // if the given one is not myNode or not in my routing table add
        if (res.body && !routingTable[res.body.node.name] && res.body.node.name !== myNode.name) {
            // if (!((res.body.node.name in routingTable) || (res.body.node.name === myNode.name))) {
            udp.send(res.body.node, {type: msgParser.JOIN, node: myNode}, (res1, err) => {
                if (err === null) {
                    let node = res1.body.node;
                    if (res1.body.success) {
                        routingTable[res.body.node.name] = node;
                        logger.info("Node: Added to routing table - " + node.ip + ":" + node.port);
                    } else {
                        logger.error("Node: Error in joining, Node - " + node.ip + ":" + node.port);
                    }
                }
            });
        }
    });

}

/**
 * Common function to shutdown
 * @param error 0 - gracefully , 1 - error
 */
function shutdown(error) {
    if (error === 0) {
        logger.warning("Node: Gracefully shutting down.....");
        // TODO: stop discovery first

        let leaveCount = 0;
        let totalRoutingTableCount = Object.keys(routingTable).length;

        if (totalRoutingTableCount === 0) {
            logger.ok("Node: Leaving");
            process.exit(0);
        }

        Object.keys(routingTable).forEach(nodeKey => {
            let node = routingTable[nodeKey];
            udp.send(node, {type: msgParser.LEAVE, node: myNode}, (res, err) => {
                if (err === null) {

                    leaveCount++;

                    // LEAVE_OK from everyone and then UNREG
                    if (leaveCount === totalRoutingTableCount) {
                        // inform to bootstrap server
                        let unregMsg = msgParser.generateUNREG({
                            ip: myNode.ip, port: myNode.port, name: myNode.name
                        });
                        tcp.init(bsNode.ip, bsNode.port, (error) => {
                            logger.error(error);
                        });
                        tcp.sendMessage(unregMsg, (receivedMsg) => {
                            logger.ok("Node: Leaving");
                            process.exit(error);
                        });
                    }

                } else {
                    logger.error(err);
                }
            });
        });
    } else {
        process.exit(error);
    }
}

/**
 * Server start - starts UDP listening, CLI and picks files
 */
function start() {
    udpStart();
    cliStart();
    pickFiles();
}

/**
 * Starts UDP listener. Requests hit here. Each case to handle each type of request.
 */
function udpStart() {
    udp.init(myNode.port, (req, res) => {
        let body = req.body;
        // logger.info('- incoming message', JSON.stringify(body));
        switch (body['type']) {
            case msgParser.JOIN: // name, address
                routingTable[body.node.name] = {
                    ip: body.node.ip,
                    port: body.node.port
                };
                logger.info("Node: Added to routing table - " + body.node.ip + ":" + body.node.port);
                // TODO: can handle routing table exceeding - success: false
                res.send({type: msgParser.JOIN_OK, success: true});
                break;

            case msgParser.LIVE:
                res.send({type: msgParser.LIVE_OK, success: true});
                break;

            case msgParser.DISC:
                // pick a random node from my routing table and send
                let pickedOne = random.pickOne(routingTable);
                res.send({type: msgParser.DISC_OK, node: pickedOne, success: true});
                break;

            case msgParser.LEAVE:
                delete routingTable[body.node.name];
                logger.info("Node: Removed from routing table - " + body.node.ip + ":" + body.node.port);

                res.send({type: msgParser.LEAVE_OK, success: true});
                break;

            case msgParser.SER:
                //TODO: complete
                search(body.searchString,
                    {ip: body.node.ip, port: body.node.port},
                    parseInt(body.hopCount),
                    {ip: req.rinfo.address, port: req.rinfo.port});
                break;

            case msgParser.SER_OK:
                //TODO: complete
                logger.ok("Node: Search Results\n-------------------");
                logger.ok("From - " + body.node.ip + ":" + body.node.port);
                logger.ok("Files - " + body.fileNames);
                logger.ok("Hop Count - " + body.hopCount + "\n-------------------");
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

/**
 * Starts CLI.
 */
function cliStart() {
    cli.init({
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
            logger.print('My address table: ');
            Object.keys(routingTable).forEach(a => {
                logger.print('\t', a, ": ", routingTable[a]);
            })
        },
        'name': () => {
            logger.print(myNode.name);
        },
        'search': (params) => {
            // search command = search "hello world"
            let searchString = params['_'][1];

            search(searchString, myNode, 0, null);
        },
        'files': () => {
            logger.print(files);
        },
        'exit': () => {
            shutdown(0);
        }
    });
}

/**
 * 1. Picks random file count from 3-5 and selects random file names of that count
 * 2. Iterate through picked file names and adds objects of random size 2-10 to files
 */
function pickFiles() {
    let randomFileCount = random.getRandomIntFromInterval(MIN_FILES_PER_NODE, MAX_FILES_PER_NODE);
    let randomSetOfFileNames = random.selectRandom(randomFileCount - 1, fileController.fileNames);

    Object.keys(randomSetOfFileNames).forEach((key) => {
        //TODO: Project description says "generate random size on file request". Keep this.
        let randomFileSize = random.getRandomIntFromInterval(MIN_FILE_SIZE, MAX_FILE_SIZE);
        // let musicFile = new MusicFile.MusicFile(randomSetOfFileNames[key], randomFileSize);
        // files.push(musicFile);
        files[randomSetOfFileNames[key]] = {size: randomFileSize};
    });
}


/**
 * Random walk search
 * 1. Search inside logic
 * 2. If not found pick random from routing table and send
 *
 * @param searchString: search string covered with quotation marks - "Lord of"
 * @param searchNode: node that originates the search query
 * @param hopCount: current hop count - increased by 1 inside the method
 * @param requestNode: node which requested this search from my node
 *
 */
function search(searchString, searchNode, hopCount, requestNode) {
    //TODO: implement

    let found = false;

    searchString = searchString.toString().slice(1, -1);

    let fileNames = Object.keys(files);

    //returns an array
    let resultFileNames = searchAlgo.search(searchString, fileNames);
    if (resultFileNames.length !== 0) {
        found = true;
        logger.debug("Node: Search Results - " + resultFileNames);
    }

    if (!found) {
        // search message passing - SER
        if (Object.keys(routingTable).length > 0) {
            let nextNode = random.pickOne(routingTable);

            if (requestNode !== null) {
                while ((requestNode.ip === nextNode.ip) && (requestNode.port === nextNode.port)) {
                    nextNode = random.pickOne(routingTable);
                }
            }

            logger.debug("Node: Picked Search Node - " + nextNode.ip + ":" + nextNode.port + " " + nextNode.name);

            hopCount = hopCount + 1;

            let data = {
                searchString: searchString,
                node: searchNode,
                hopCount: hopCount,
                type: msgParser.SER,
            };

            udp.send(nextNode, data, (res, err) => {
                //TODO: complete
            });
        }
    } else {
        // file is found in the search query originating node
        if (requestNode === null) {

        } else {
            let data = {
                type: msgParser.SER_OK,
                hopCount: hopCount,
                fileNames: resultFileNames,
                node: myNode,
            };

            // send search results - SEROK
            udp.send(searchNode, data, (res, err) => {
                //TODO: complete
            });
        }
    }
}