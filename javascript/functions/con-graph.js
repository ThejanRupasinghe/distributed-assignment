const udp = require('../lib/udp-message');
const random = require('../lib/random');
const log = require('../lib/logger');

const ERRORCODE = 'ECONNREFUSED';

module.exports.cli = (params, rTable) => {
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
};

module.exports.serverHandle = (req, res, rTable, name) => {
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
};