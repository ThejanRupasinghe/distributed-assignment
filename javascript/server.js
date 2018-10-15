//<editor-fold desc="imports">
const random = require('./lib/random');
const cli = require('./lib/cli');
const log = require('./lib/logger');
const minimist = require('minimist');
const udp = require('./lib/udp-message');
//</editor-fold>

let argv, name = '';
let myAddress = {
    ip: '127.0.0.1',
    port: 40000
};

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
udp.init(myAddress.port, (req, res) => {
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
            require('./functions/send-msg').serverHandle(req, res, rTable, name);
            break;
        case 'send-msg-rel': // reliable

            break;
        case 'con-graph':
            require('./functions/con-graph').serverHandle(req, res, rTable, name);
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
        require('./functions/send-msg').cli(params, rTable, name);
    },
    'send-msg-rel': (params) => { // reliable (target, msg, ttl)

    },
    'con-graph': (params) => { // ttl,
        require('./functions/con-graph').cli(params, rTable)
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