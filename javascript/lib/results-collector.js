const fs = require('fs');
const path = require('path');
const readline = require('readline');
const logger = require('./logger');
const os = require('os');
const nodeServer = require('../server');

let noOfUdpMsgs = 0;
let noOfUdpSentMsgs = 0;
let noOfUdpReceivedMsgs = 0;

let noOfTcpMsgs = 0;
let noOfTcpSentMsgs = 0;
let noOfTcpReceivedMsgs = 0;

let noOfIssuedSearches = 0;
let noOfSuccessSearches = 0;
let noOfFailedSearches = 0;

let totalHopCount = 0;

module.exports.plusUdpReceivedMsg = () => {
    noOfUdpReceivedMsgs++;
    noOfUdpMsgs++;
};

module.exports.plusUdpSentMsg = () => {
    noOfUdpSentMsgs++;
    noOfUdpMsgs++;
};

module.exports.plusTcpSentMsg = () => {
    noOfTcpSentMsgs++;
    noOfTcpMsgs++;
};

module.exports.plusTcpReceivedMsg = () => {
    noOfTcpReceivedMsgs++;
    noOfTcpMsgs++;
};

module.exports.plusIssuedSearches = () => {
    noOfIssuedSearches++;
};

module.exports.plusIssuedSearches = () => {
    noOfIssuedSearches++;
};

module.exports.plusSuccessSearches = () => {
    noOfSuccessSearches++;
};

module.exports.plusFailedSearches = () => {
    noOfFailedSearches++;
};

module.exports.addHopCount = (hopCount) => {
    totalHopCount += hopCount;
};

module.exports.searchTest = () => {
    // let filePath = path.join(__dirname, 'resources', "queries.txt");
    let filePath = path.join(os.homedir(), "Downloads", "queries.txt");

    console.log(filePath);

    let queries;

    fs.readFile(filePath, (err, data) => {
        if (err) {
            logger.error("Results: Error in reading file.");
        } else {
            queries = data.toString().replace(/\r/g, '').split("\n");

            queries.forEach(query => {
                nodeServer.search(query,null,0,null);
            });
        }

    });

};