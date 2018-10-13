//<editor-fold desc="imports">
const http = require('../lib/message');
const random = require('../lib/random');
const cli = require('../lib/cli');
const log = require('../lib/logger');
const express = require('express');
const minimist = require('minimist');
const app = express();
let listener, argv, name = '';
let port = 4000;
//</editor-fold>

// for central node
const rTable = {};
let resource = [];

const ERRORCODE = 'ECONNREFUSED';

// identification route. Not do much things (PING)
app.get('/', (req, res) => {
    res.jsonp({live: true, address: req.protocol + '://' + req.get('host') + req.originalUrl, name: name});
});

// message handler
app.get('/msg', (req, res) => {
    let msg = req.query;
    log.info('- incoming message', msg);
    switch (msg['type']) {
        case 'ping':
            break;
        case 'pong':
            break;
        case 'join': // name, address
            log.info('Join - ', msg['name'], msg['address']);
            rTable[msg['name']] = msg['address'];
            res.jsonp({success: true});
            break;
        case 'send-msg': // not reliable
            if (parseInt(msg['status']) === 1 && msg['target'] === name) {
                // This is destination
                log.print('Incoming message => ', msg['msg']);
                res.jsonp({success: true, msg: 'got it'});
            } else {

                const funcSendRequest = (currentTarget, ttl, status) => {
                    http.send(currentTarget, 'send-msg',
                        {
                            status: status,
                            ttl: ttl,
                            msg: msg['msg'],
                            target: msg['target']
                        },
                        (err, res1, body) => {
                            if (err && err.code === ERRORCODE) {
                                log.error(currentTarget, 'is not live....');
                                delete rTable[currentTarget];
                                let randomPick = random.pickOne(rTable);
                                log.warning('try a random pick node', randomPick);
                                funcSendRequest(randomPick, ttl, status);
                            } else {
                                log.info(body);
                            }
                        });
                };

                if (rTable[msg['target']]) {
                    // know ( next hope)
                    log.ok('==== know', msg['target']);
                    funcSendRequest(rTable[msg['target']], parseInt(msg['ttl']) - 1 , 1);
                    res.jsonp({success: true, msg: 'found in next hope'});
                } else {
                    // don't know (use random walk)
                    if (parseInt(msg['ttl']) > 1) {
                        log.warning('==== dont know', msg['target']);
                        let randomPick = random.pickOne(rTable);
                        log.warning('random pick', randomPick);
                        funcSendRequest(randomPick, parseInt(msg['ttl']) - 1, 0);
                        res.jsonp({success: true, msg: 'Not found in next hope, TTL is ' + (parseInt(msg['ttl']) - 1)});
                    } else {
                        log.error('TTL fail');
                        res.jsonp({success: true, msg: 'Not enough TTL'});
                    }
                }
            }
            break;
        case 'send-msg-rel': // reliable
            if (parseInt(msg['status']) === 1 && msg['target'] === name) {
                // This is destination
                log.print(msg['msg']);
                res.jsonp({success: true, msg: 'got it in ttl ' + msg['ttl'], path: [name]});
            } else {
                if (rTable[msg['target']]) {
                    // know ( next hope)
                    log.ok('==== know', msg['target']);
                    http.send(rTable[msg['target']], 'send-msg-rel',
                        {
                            status: 1,
                            ttl: parseInt(msg['ttl']),
                            msg: msg['msg'],
                            target: msg['target']
                        }, (err, res1, body) => {
                            log.info('body====', body);
                            body = JSON.parse(body);
                            body.path.push(name);
                            res.jsonp({success: body.success, msg: body.msg, path: body.path});
                        });
                } else {
                    // don't know (use random walk)
                    if (parseInt(msg['ttl']) > 0) {
                        log.warning('==== dont know', msg['target']);
                        let randomPick = random.pickOne(rTable);
                        log.warning('random pick', randomPick);
                        http.send(randomPick, 'send-msg-rel',
                            {
                                status: 0, ttl: parseInt(msg['ttl']) - 1, target: msg['target'], msg: msg['msg']
                            }, (err, res1, body) => {
                                log.info('body====', body);
                                body = JSON.parse(body);
                                body.path.push(name);
                                res.jsonp({success: body.success, msg: body.msg, path: body.path});
                            });
                    } else {
                        log.error('TTL fail');
                        res.jsonp({success: false, msg: 'Not enough TTL', path: [name]});
                    }
                }
            }
            break;
        case 'con-graph':
            if (parseInt(msg['ttl']) === 1) {
                let tbl = {};
                tbl[name] = Object.keys(rTable);
                res.jsonp({success: true, rTable: tbl})
            } else {
                let keys = Object.keys(rTable);
                let count = 0;
                let tbl = {};
                keys.forEach(k => {
                    http.send(rTable[k], 'con-graph', {ttl: parseInt(msg['ttl']) - 1}, (err, res1, body) => {
                        count += 1;
                        body = JSON.parse(body);
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

//<editor-fold desc="starting">

// take command line arguments (port, bs)
argv = minimist(process.argv.slice(2));

// init according to argv
if (argv.port) {
    port = argv.port;
    name = 'node_' + (port - 4000);
}
if (argv.name) {
    name = argv.name;
}
log.print('----------- ', name, ' -----------');

resource = argv['_'];

bs = argv['bs'];
// initial join request from bootstrap server
if (bs) {
    http.send('localhost:' + bs, 'bs', {name: name, address: 'localhost:' + port}, (err, res, body) => {
        // give warning if there is any conflicts in current and received addresses.
        log.info(body);
        body = JSON.parse(body);
        if (body) {
            Object.keys(body).forEach(k => {
                http.send(body[k], 'join', {name: name, address: 'localhost:' + port}, (err, res, body1) => {
                    body1 = JSON.parse(body1);
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

// start the server
listener = require('./www').start(app, port);
// </editor-fold>

// CLI
cli.init({
    'send-msg': (params) => { // (target, msg, ttl) not reliable
        if (params['target']) {
            let target = params['target'], msg = params['msg'] || '--empty_message--';

            const funcSendRequest = (currentTarget, ttl, status) => {
                http.send(currentTarget, 'send-msg',
                    {
                        status: status,
                        ttl: ttl,
                        msg: msg,
                        target: target
                    },
                    (err, res1, body) => {
                        if (err && err.code === ERRORCODE) {
                            log.error(currentTarget, 'is not live....');
                            delete rTable[currentTarget];
                            let randomPick = random.pickOne(rTable);
                            log.warning('try a random pick node', randomPick);
                            funcSendRequest(randomPick, ttl, 0);
                        } else {
                            log.info(body);
                        }
                    });
            };

            if (rTable[target]) {
                // know
                log.ok('==== know', target);
                funcSendRequest(rTable[target], 5, 1);
            } else {
                // dont know (use random walk)
                log.warning('==== dont know', target);
                let randomPick = random.pickOne(rTable);
                log.warning('random pick', randomPick);
                funcSendRequest(randomPick, (params['ttl'] || 5), 0);
            }
        }
    },
    'send-msg-rel': (params) => { // reliable (target, msg, ttl)
        if (params['target']) {
            let target = params['target'], msg = params['msg'] || '--empty_message--';
            if (rTable[target]) {
                // know
                log.ok('==== know', target);
                http.send(rTable[target], 'send-msg-rel',
                    {status: 1, ttl: (params['ttl'] || 5), msg: msg, target: target}, (err, res1, body) => {
                        if (JSON.parse(body).success) {
                            log.print(body);
                        } else {
                            log.error(body);
                        }
                    })
            } else {
                // dont know (use random walk)
                log.warning('==== dont know', target);
                let randomPick = random.pickOne(rTable);
                log.warning('random pick', randomPick);
                http.send(randomPick, 'send-msg-rel',
                    {status: 0, ttl: (params['ttl'] || 5), target: target, msg: msg}, (err, res1, body) => {
                        if (JSON.parse(body).success) {
                            log.print(body);
                        } else {
                            log.error(body);
                        }
                    })
            }
        }
    },
    'con-graph': (params) => { // ttl,
        let keys = Object.keys(rTable);
        let count = 0;
        let tbl = {};
        Object.keys(rTable).forEach(k => {
            http.send(rTable[k], 'con-graph', {ttl: (parseInt(params['ttl']) || 4)}, (err, res, body) => {
                count += 1;
                body = JSON.parse(body);
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
    'delete': (params) => {
        let count = 0;
        Object.keys(rTable).forEach(k => {
            http.send(rTable[k], 'delete', {name: name}, (ree, res, body) => {
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