const cli = require('./lib/cli');
const randome = require('./lib/random');
const log = require('./lib/logger');
const udp = require('./lib/udp-message');
let argv;
let port = 3000;

// take command line argumnets (port)
argv = require('minimist')(process.argv.slice(2));

// init according to argv
if (argv.port) {
    port = argv.port;
}

// for central node
const rTable = {};

// identification route. Not do much things (PING)
udp.init(port, (req, res) => {
    let body = req.body;
    log.info('[server]', 'body', body);
    if (body.type === 'bs') {
        const randomPicks = randome.selectRandom(2, rTable);
        // log.info('[server]', 'response', randomPicks);
        res.jsonp(randomPicks);
        rTable[body['name']] = body['address'];
    } else {
        res.jsonp({success: false});
    }
});

// CLI
cli.init({
    'at': () => {
        log.info('your address table: ');
        Object.keys(rTable).forEach(a => {
            log.info('\t', a, ":", rTable[a]);
        })
    }
});