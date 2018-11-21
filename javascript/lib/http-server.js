const app = require('express')();
const http = require('http');
const logger = require('./logger');
const fileController = require('./file-controller');
const request = require('request');

module.exports.init = (port) => {
    app.get('/get-file/:query', (req, res) => {
        // let x = fileController.generateRandomData(1);
        // console.log(x);
        // TODO get the file
        console.log(req.params['query']);
        res.send("This is your file");
    });

    app.get('/con-graph', (req, res) => {
        console.log(req.query);
        res.send('test');
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
    Object.keys(routingTable).forEach(k => {

        let data = Object.keys({
            type: 'con-graph',
            ttl: 5
        });
        let queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');

        request({method: 'GET', url: 'http://' + routingTable[k]['ip'] + ':' +
                (routingTable[k]['port'] + 5) + '/con-graph?' + queryString}, (data) => {
            console.log(data);
        });
        //
        // http.send(rTable[k], 'con-graph', {ttl: (parseInt(params['ttl']) || 4)}, (err, res, body) => {
        //     count += 1;
        //     body = JSON.parse(body);
        //     Object.keys(body.rTable).forEach(x => {
        //         tbl[x] = body.rTable[x];
        //     });
        //     if (count === keys.length) { // grab all responses
        //         let x = JSON.parse(JSON.stringify(tbl).replace(/node_/g, ''));
        //         let y = parseInt(params['max']) || Object.keys(x).length;
        //         for (let i = 0; i < y; i++) {
        //             let line = [];
        //             for (let j = 0; j < y; j++) {
        //                 if (x[i].indexOf(j.toString()) < 0) {
        //                     line.push(0)
        //                 } else {
        //                     line.push(1)
        //                 }
        //             }
        //             log.print(line.join(', '));
        //         }
        //         log.print('past above adjacency matrix as text:');
        //         log.print('http://graphonline.ru/en/create_graph_by_matrix');
        //     }
        // });
    });



    // let queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
    // request({method: 'GET', url: ptcl + url + '/msg?' + queryString}, next);
};