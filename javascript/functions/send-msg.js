const udp = require('../lib/udp-message');
const random = require('../lib/random');
const log = require('../lib/logger');

const ERRORCODE = 'ECONNREFUSED';

module.exports.cli = (params, rTable, name) => {
    if (params['target']) {
        let targetName = params['target'];
        let message = params['msg'] || '-- empty message --';

        const funcRequestSender = (sendAddr, ttl) => {
            udp.send(sendAddr, {
                type: 'send-msg',
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
};

module.exports.serverHandle = (req, res, rTable, name) => {
    let body = req.body;
    if (body.targetName === name) {
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
                if (err1 && err1.code === ERRORCODE) {
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
            if (parseInt(body.ttl) > 1) {
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
};