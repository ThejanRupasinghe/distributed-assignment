//<editor-fold desc="imports">
const random = require('./lib/random');
const cli = require('./lib/cli');
const log = require('./lib/logger');
const minimist = require('minimist');
const udp = require('./lib/udp-message');
let argv, name = '';
let myAddress = {
    ip: '127.0.0.1',
    port: 40000
};
//</editor-fold>

// for central node
const rTable = {};
let resource = [];

const ERRORCODE = 'ECONNREFUSED';

// take command line arguments (port, bs)
argv = minimist(process.argv.slice(2));

// init according to argv
if (argv.port) {
    myAddress.port = argv.port;
    name = 'node_' + (myAddress.port - 4000);
}
if (argv.name) {
    name = argv.name;
}
log.print('----------- ', name, ' -----------');

resource = argv['_'];


// message handler
udp.server(myAddress.port, (req, res) => {
    let body = req.body;
    log.info('- incoming message', JSON.stringify(body));
    switch (body['type']) {
        case 'ping':
            break;
        case 'pong':
            break;
        case 'join': // name, address
            // log.info('Join - ', body['name'], body['address']);
            rTable[body['name']] = body['address'];
            res.jsonp({success: true});
            break;
        case 'send-msg': // not reliable
            if(body.targetName === name) {
                log.print('Incoming message => ', body.msg);
                log.print('\t from => ', body.from);
                res.jsonp({success: true, msg: 'got it'});
            } else {
                const funcMessageSender = (sendAddr, ttl) => {
                    udp.send(sendAddr, {
                        type: 'send-msg',
                        ttl: ttl,
                        msg: body.msg,
                        from: body.from,
                        targetName: body.targetName
                    }, (err1, res1, body1) => {
                        if(err1 && err1.code === ERRORCODE) {
                            log.error(sendAddr, 'is not live ...');
                            delete rTable[body.targetName];
                            let randomPick = random.pickOne(rTable);
                            log.warning('try a random pick node', randomPick);
                            funcMessageSender(randomPick, ttl);
                        } else {
                            log.info(body1);
                        }
                    })
                };

                if (rTable[body.targetName]) {
                    log.ok('Know it', body.targetName);
                    funcMessageSender(rTable[body.targetName], parseInt(body.ttl) - 1);
                    res.jsonp({success: true, msg: 'Fount in the next hope'});
                } else {
                    if(parseInt(body.ttl) > 1) {
                        log.warning('Dont know ', body.targetName);
                        delete rTable[body.targetName];
                        let randomPick = random.pickOne(rTable);
                        log.warning('Pick a random one', randomPick);
                        funcMessageSender(randomPick, parseInt(body.ttl) - 1);
                        res.jsonp({success: true, msg: 'Not found in next hope. TTL: ' + parseInt(body.ttl) - 1});
                    } else {
                        log.error('TTL fail..');
                        res.jsonp({success: false, msg: 'Not enough TTL'});
                    }
                }
            }

            break;
        case 'send-msg-rel': // reliable
            // if(body.targetName === name) {
            //     log.print('Incoming message => ', body.msg);
            //     log.print('\t from => ', body.from);
            //     res.jsonp({success: true, msg: 'got it in ttl: ' + body.ttl, path: [name]});
            // } else {
            //     const funcMessageSender = (sendAddr, ttl) => {
            //         udp.send(sendAddr, {
            //             type: 'send-msg',
            //             ttl: ttl,
            //             msg: body.msg,
            //             from: body.from,
            //             targetName: body.targetName
            //         }, (err1, res1, body1) => {
            //             if(err1 && err1.code === ERRORCODE) {
            //                 log.error(sendAddr, 'is not live ...');
            //                 delete rTable[body.targetName];
            //                 let randomPick = random.pickOne(rTable);
            //                 log.warning('try a random pick node', randomPick);
            //                 return funcMessageSender(randomPick, ttl);
            //             } else {
            //                 log.info('body', body1);
            //             }
            //             body1.path.push(name);
            //             res.jsonp({success: body1.success, msg: body1.msg, path: body1.path})
            //         })
            //     };
            //
            //     if (rTable[body.targetName]) {
            //         log.ok('Know it', body.targetName);
            //         funcMessageSender(rTable[body.targetName], parseInt(body.ttl) - 1);
            //         // res.jsonp({success: true, msg: 'Fount in the next hope'});
            //     } else {
            //         if(parseInt(body.ttl) > 1) {
            //             log.warning('Dont know ', body.targetName);
            //             delete rTable[body.targetName];
            //             let randomPick = random.pickOne(rTable);
            //             log.warning('Pick a random one', randomPick);
            //             funcMessageSender(randomPick, parseInt(body.ttl) - 1);
            //             // res.jsonp({success: true, msg: 'Not found in next hope. TTL: ' + parseInt(body.ttl) - 1});
            //         } else {
            //             log.error('TTL fail..');
            //             // res.jsonp({success: false, msg: 'Not enough TTL'});
            //         }
            //     }
            // }
            break;
        case 'con-graph':
            if (body.ttl === 1) {
                let tbl = {};
                tbl[name] = Object.keys(rTable);
                res.jsonp({success: true, rTable: tbl})
            } else {
                let keys = Object.keys(rTable);
                let count = 0;
                let tbl = {};
                keys.forEach(k => {
                    udp.send(rTable[k], {type: 'con-graph', ttl: parseInt(body.ttl) - 1}, (err, res1, body) => {
                        count += 1;
                        // body = JSON.parse(body);
                        Object.keys(body.rTable).forEach(x => {
                            tbl[x] = body.rTable[x];
                        });
                        if (count === keys.length) { // grab all responses
                            res.jsonp({success: true, rTable: tbl})
                        }
                    });
                });
            }
            break;
        case 'delete':
            if (rTable[msg.name]) {
                delete rTable[msg.name];
            }
            res.end();
            break;
        case 'force-delete':
            // call exit
            break;
    }
});

bs = {
    port: argv['bs'],
    address: '127.0.0.1'
};
// initial join request from bootstrap server
if (bs) {
    udp.send(bs, {type: 'bs', name: name, address: myAddress}, (err, res, body) => {
        // give warning if there is any conflicts in current and received addresses.
        log.info('[body]', body);
        // body = JSON.parse(body);
        if (body) {
            Object.keys(body).forEach(k => {
                udp.send(body[k], {type: 'join', name: name, address: myAddress}, (err, res, body1) => {
                    // body1 = JSON.parse(body1);
                    if (body1['success']) {
                        rTable[k] = body[k];
                    } else {
                        log.error('error');
                    }
                });
            })
        }
    });
}

// CLI
cli.init({
    'send-msg': (params) => { // (target, msg, ttl) not reliable
        if(params['target']) {
            let targetName = params['target'];
            let message = params['msg'] || '-- empty message --';

            const funcRequestSender = (sendAddr, ttl) => {
                udp.send(sendAddr, {type: 'send-msg',
                    ttl: ttl,
                    msg: message,
                    from: name,
                    targetName: targetName
                }, (err, res, body) => {
                    if (err && err.code === ERRORCODE) {
                        log.error(sendAddr, 'is not live...');
                        delete rTable[targetName];
                        let randomPick = random.pickOne(rTable);
                        log.warning('try a random pick one', randomPick);
                        funcRequestSender(randomPick, ttl);
                        log.info(body)
                    }
                });
            };

            if (rTable[targetName]) {
                log.ok('Know the target', targetName);
                funcRequestSender(rTable[targetName], 5);
            } else {
                log.warning('Dont know the target', targetName);
                let randomPick = random.pickOne(rTable);
                log.warning('random pick one', randomPick);
                funcRequestSender(randomPick, (params['ttl'] || 5));
            }
        } else {
            log.error('No target given');
        }
    },
    'send-msg-rel': (params) => { // reliable (target, msg, ttl)
        // if(params['target']) {
        //     let targetName = params['target'];
        //     let message = params['msg'] || '-- empty message --';
        //
        //     const funcRequestSender = (sendAddr, ttl) => {
        //         udp.send(sendAddr, {type: 'send-msg-rel',
        //             ttl: ttl,
        //             msg: message,
        //             from: name,
        //             targetName: targetName
        //         }, (err, res, body) => {
        //
        //             if (err && err.code === ERRORCODE) {
        //                 log.error(sendAddr, 'is not live...');
        //                 delete rTable[targetName];
        //                 let randomPick = random.pickOne(rTable);
        //                 log.warning('try a random pick one', randomPick);
        //                 return funcRequestSender(randomPick, ttl);
        //             }
        //             if(body.success) {
        //                 log.print(body);
        //             } else {
        //                 log.error(body);
        //             }
        //         });
        //     };
        //
        //     if (rTable[targetName]) {
        //         log.ok('Know the target', targetName);
        //         funcRequestSender(rTable[targetName], 5);
        //     } else {
        //         log.warning('Dont know the target', targetName);
        //         let randomPick = random.pickOne(rTable);
        //         log.warning('random pick one', randomPick);
        //         funcRequestSender(randomPick, (params['ttl'] || 5));
        //     }
        // } else {
        //     log.error('No target given');
        // }
    },
    'con-graph': (params) => { // ttl,
        let keys = Object.keys(rTable);
        let count = 0;
        let tbl = {};
        Object.keys(rTable).forEach(k => {
            udp.send(rTable[k], {type: 'con-graph', ttl: (parseInt(params['ttl']) || 4)}, (err, res, body) => {
                count += 1;
                // body = JSON.parse(body);
                Object.keys(body.rTable).forEach(x => {
                    tbl[x] = body.rTable[x];
                });
                if (count === keys.length) { // grab all responses
                    let x = JSON.parse(JSON.stringify(tbl).replace(/node_/g, ''));
                    let y = parseInt(params['max']) || Object.keys(x).length;
                    for (let i = 0; i < y; i++) {
                        let line = [];
                        for (let j = 0; j < y; j++) {
                            if (x[i].indexOf(j.toString()) < 0) {
                                line.push(0)
                            } else {
                                line.push(1)
                            }
                        }
                        log.print(line.join(', '));
                    }
                    log.print('past above adjacency matrix as text:');
                    log.print('http://graphonline.ru/en/create_graph_by_matrix');
                }
            });
        });
    },
    'delete': () => {
        let count = 0;
        Object.keys(rTable).forEach(k => {
            udp.send(rTable[k], 'delete', {name: name}, () => {
                count += 1;
                if (count === Object.keys(rTable).length) {
                    process.exit();
                }
            });
        });
    },
    'at': () => {
        log.print('your address table: ');
        Object.keys(rTable).forEach(a => {
            log.print('\t', a, ": ", rTable[a]);
        })
    },
    'name': () => {
        log.print(name);
    }
});