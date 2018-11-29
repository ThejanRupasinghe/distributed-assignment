const fs = require('fs');
const path = require('path');
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
let totalSearchTime = 0;

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

    let queries;

    fs.readFile(filePath, (err, data) => {
        if (err) {
            logger.error("Results: Error in reading file.");
        } else {
            queries = data.toString().replace(/\r/g, '').split("\n");

            queries.forEach(query => {
                let tempQuery = "\"" + query + "\"";
                nodeServer.search(tempQuery, null, 0, null);
                noOfIssuedSearches++;
            });
        }
    });
};

module.exports.printSearchStats = () => {
    logger.ok("RESULTS: SEARCH STATS");
    logger.ok("----------------------------");
    logger.ok("Issued Searches : " + noOfIssuedSearches);
    logger.ok("Success Searches : " + noOfSuccessSearches);
    logger.ok("Failed Searches : " + noOfFailedSearches);
    logger.ok("Average Hop Count : " + parseInt(totalHopCount / noOfIssuedSearches));
    logger.ok("Total Search Time : " + totalSearchTime + " ms");
    logger.ok("Average Search Time : " + parseInt(totalSearchTime/noOfIssuedSearches) + " ms");
    logger.ok("----------------------------");
};

module.exports.resetSearchStats = () => {
    noOfIssuedSearches = 0;
    noOfFailedSearches = 0;
    noOfSuccessSearches = 0;
    logger.info("RESULTS: Search Stat reset.");
};

module.exports.printMsgStats = () => {
    logger.ok("RESULTS: MSG STATS");
    logger.ok("----------------------------");
    logger.ok("Sent UDP : " + noOfUdpSentMsgs);
    logger.ok("Received UDP : " + noOfUdpReceivedMsgs);
    logger.ok("----------------------------");
    logger.ok("Sent TCP : " + noOfTcpSentMsgs);
    logger.ok("Received TCP : " + noOfTcpReceivedMsgs);
    logger.ok("----------------------------");
};

module.exports.resetMsgStats = () => {
    noOfUdpMsgs = 0;
    noOfUdpSentMsgs = 0;
    noOfUdpReceivedMsgs = 0;
    noOfTcpMsgs = 0;
    noOfTcpSentMsgs = 0;
    noOfTcpReceivedMsgs = 0;
    logger.info("RESULTS: Message Stat reset.");
};

module.exports.searchLatencyTest = () => {
    // let filePath = path.join(__dirname, 'resources', "queries.txt");
    let filePath = path.join(os.homedir(), "Downloads", "queries.txt");

    let queries;

    fs.readFile(filePath, (err, data) => {
        if (err) {
            logger.error("Results: Error in reading file.");
        } else {
            queries = data.toString().replace(/\r/g, '').split("\n");

            let index = 0;
            const myFunction = () => {
                index++;
                if (index > queries.length) {
                    return
                }

                let tempQuery = "\"" + queries[index] + "\"";
                nodeServer.search(tempQuery, null, 0, null);

                setTimeout(myFunction, 10000);
            };
            myFunction();
        }
    });
};

module.exports.addTotalSearchTime = (searchTime) => {
    totalSearchTime += searchTime;
};