const app = require('express')();
const http = require('http');
const logger = require('./logger');
const fileController = require('./file-controller');
const request = require('request');

/**
 * Initializes the HTTP Server for file transferring and connection matrix calculating
 * @param port port for the HTTP server to listen on
 * @param routingTable routing table of the node
 * @param myNode node details
 * @param files file list of the node
 */
module.exports.init = (port, routingTable, myNode, files) => {

    //file sending mechanism
    app.get('/get-file/:query', (req, res) => {

        let fileName = req.params['query'];

        if (fileName in files) {
            let fileSize = files[fileName].size;

            let file = fileController.generateRandomData(fileSize); //file size in MBs
            let hash = fileController.calcHash(file);

            logger.info("HTTP: Sends file and hash - " + fileName + "- to " + req.hostname);

            res.send({
                file: file,
                hash: hash
            });
        } else {
            logger.error("HTTP: Requested file name is not in the file list");
            res.send({
                file: 'NOT FOUND'
            })
        }
    });

    // collects data from all nodes to draw the connection graph matrix
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

/**
 * Creates the connection graph matrix, Called from the cli command
 * @param routingTable
 */
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
            method: 'GET',
            url: 'http://' + routingTable[k]['ip'] + ':' + (parseInt(routingTable[k]['port']) + 5) + '/con-graph?' + queryString
        }, (err, res, body) => {
            count++;
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

                logger.print('paste above adjacency matrix as text:');
                logger.print('http://graphonline.ru/en/create_graph_by_matrix');
            }
        });
    });
};