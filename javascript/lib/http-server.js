const app = require('express')();
const http = require('http');
const logger = require('./logger');
const fileController = require('./file-controller');
const request = require('request');

module.exports.init = (port, routingTable, myNode) => {
    app.get('/get-file/:query', (req, res) => {
        // let x = fileController.generateRandomData(1);
        // console.log(x);
        // TODO get the file
        console.log(req.params['query']);

        let file = fileController.generateRandomData(.3); // approximately 1MB
        let hash = fileController.calcHash(file);
        res.send({
            file: file,
            hash: hash
        });
    });

    app.get('/con-graph', (req, res) => {

        let ttl = parseInt(req.query['ttl']); // get the ttl from the request

        if (ttl === 0) { // if ttl is 0, this is end node. so send the data from its routing table
            let tbl = {};
            tbl[myNode.name] = Object.keys(routingTable);
            res.jsonp({rTable: tbl});
        } else { // this is middle node. it has to collect data from its neighbours
            let count = 0;
            let tbl = {};
            let keys = Object.keys(routingTable);

            keys.forEach(k => {
                let data = {
                    ttl: ttl - 1,
                };
                let queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
                // send the request to its neighbours with ttl - 1
                request({
                        method: 'GET',
                        url: 'http://' + routingTable[k]['ip'] + ':' + (parseInt(routingTable[k]['port']) + 5)
                            + '/con-graph?' + queryString
                    },
                    (err, response, body) => {
                        count++; // count the response
                        body = JSON.parse(body);
                        Object.keys(body.rTable).forEach(x => {
                            tbl[x] = body.rTable[x]; // add to routing table
                        });
                        if (count === keys.length) {
                            res.jsonp({rTable: tbl}); // send the response
                        }
                    });
            });
        }
    });

    app.set('port', port.toString());

    let server = http.createServer(app);

    server.listen(port);

    server.on('listening', () => {
        logger.info('HTTP: HTTP server started at', port);
    });
};

module.exports.createConnectionGraph = (routingTable) => {
    let keys = Object.keys(routingTable);
    let count = 0;
    let tbl = {};
    Object.keys(routingTable).forEach(k => { // send request to all nodes

        let data = {
            ttl: 5
        };
        let queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
        request({
            method: 'GET', url: 'http://' + routingTable[k]['ip'] + ':' +
                (parseInt(routingTable[k]['port']) + 5) + '/con-graph?' + queryString
        }, (err, res, body) => {
            count ++;
            body = JSON.parse(body);

            Object.keys(body.rTable).forEach(x => {
                tbl[x] = body.rTable[x];
            });

            if (count === keys.length) { // grab all responses
                let x = JSON.parse(JSON.stringify(tbl).replace(/node_/g, ''));
                let nodes = Object.keys(x).sort();

                nodes.forEach(p => {
                    let line = [];
                    nodes.forEach(q => {
                        line.push(
                            x[p].indexOf(q) >= 0 ? '1' : '0'
                        );
                    });
                    console.log(line.join(', '));
                });

                logger.print('past above adjacency matrix as text:');
                logger.print('http://graphonline.ru/en/create_graph_by_matrix');
            }
        });
    });
};