const cli = require('./lib/cli');
const randome = require('./lib/random');
const log = require('./lib/logger');
const express = require('express');
const app = express();
let listener, argv;
let port = 3000;

// for central node
const rTable = {};

// identification route. Not do much things (PING)
app.get('/', (req, res) => {
    res.jsonp({live: true, address: req.protocol + '://' + req.get('host') + req.originalUrl, name: name});
});

// identification route. Not do much things (PING)
app.get('/msg', (req, res) => {
    log.info(req.query);
    try {
        let msg = req.query;
        if (msg.type === 'bs') {
            log.info('request: ', msg['name'], msg['address']);
            res.jsonp(randome.selectRandom(2, rTable));
            rTable[msg['name']] = msg['address'];
        } else {
            res.jsonp({success: false});
        }
    } catch (e) {
        log.error('Error', e);
        res.jsonp({success: false});
    }
});

// take command line argumnets (port)
argv = require('minimist')(process.argv.slice(2));

// init according to argv
if (argv.port) {
    port = argv.port;
}

// start the server
listener = require('./www').start(app, port);

// CLI
cli.init({
    'at': () => {
        log.info('your address table: ');
        Object.keys(rTable).forEach(a => {
            log.info('\t', a, ": ", rTable[a]);
        })
    }
});