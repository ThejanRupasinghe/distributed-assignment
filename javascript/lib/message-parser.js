const logger = require('./logger');

const REG = "REG";
const REG_OK = "REGOK";
const ERROR = "ERROR";
const UNREG = "UNREG";
const UNREG_OK = "UNROK";
const JOIN = "JOIN";
const JOIN_OK = "JOINOK";
const LEAVE = "LEAVE";
const LEAVE_OK = "LEAVEOK";
const SER = "SER";
const SER_OK = "SEROK";

module.exports.generateREG = (node) => {
    let message = REG + " " + node.ip + " " + node.port + " " + node.name;
    // 4 front digits and space = 5
    let packetLength = message.length + 5;
    message = ("000" + packetLength).slice(-4) + " " + message;

    return message;
};

module.exports.parseREGOK = (response, cb) => {
    let responseArr = response.split(" ");

    let status = responseArr[1];

    if (REG_OK === status) {
        let noOfNodes = parseInt(responseArr[2]);

        let nodes = {};

        switch (noOfNodes) {
            case 0:
                cb(nodes, noOfNodes, null);
                break;
            case 9999:
            case 9998:
            case 9997:
                cb(null, null, noOfNodes);
                break;
            default:
                for (let i = 3; i <= noOfNodes * 3; i += 3) {
                    nodes[responseArr[i + 2]] = {
                        ipAddr: responseArr[i],
                        port: parseInt(responseArr[i + 1]),
                    };
                }
                cb(nodes, noOfNodes, null);
                break;
        }

    } else if (ERROR === status) {
        cb(null, null, ERROR);
    }
};

module.exports.generateUNREG = (node) => {
    let message = UNREG + " " + node.ip + " " + node.port + " " + node.name;
    // 4 front digits and space = 5
    let packetLength = message.length + 5;
    message = ("000" + packetLength).slice(-4) + " " + message;

    return message;
};

module.exports.parseUNREGOK = (response) => {
    let responseArr = response.split(" ");

    let status = responseArr[1];

    if (UNREG_OK === status) {
        let code = parseInt(responseArr[2]);

        if (code === 0) {
            return 0;
        } else if (code === 9999) {
            return 1;
        }

    } else if (ERROR === status) {
        return ERROR;
    }
};

module.exports.generateJOIN = (node) => {
    let message = JOIN + " " + node.ip + " " + node.port + " " + node.name;
    // 4 front digits and space = 5
    let packetLength = message.length + 5;
    message = ("000" + packetLength).slice(-4) + " " + message;

    return message;
};

module.exports.parseJOINOK = (response) => {
    let responseArr = response.split(" ");

    let status = responseArr[1];

    if (JOIN_OK === status) {
        let code = parseInt(responseArr[2]);

        if (code === 0) {
            return 0;
        } else if (code === 9999) {
            return 1;
        }

    } else if (ERROR === status) {
        return ERROR;
    }
};

module.exports.generateLEAVE = (node) => {
    let message = LEAVE + " " + node.ip + " " + node.port + " " + node.name;
    // 4 front digits and space = 5
    let packetLength = message.length + 5;
    message = ("000" + packetLength).slice(-4) + " " + message;

    return message;
};

module.exports.parseLEAVEOK = (response) => {
    let responseArr = response.split(" ");

    let status = responseArr[1];

    if (LEAVE_OK === status) {
        let code = parseInt(responseArr[2]);

        if (code === 0) {
            return 0;
        } else if (code === 9999) {
            return 1;
        }

    } else if (ERROR === status) {
        return ERROR;
    }
};

module.exports.generateSEARCH = (node, filename, hops) => {
    let message = SER + " " + node.ip + " " + node.port + " " + filename + " " + hops;
    // 4 front digits and space = 5
    let packetLength = message.length + 5;
    message = ("000" + packetLength).slice(-4) + " " + message;

    return message;
};

// TODO: complete the parser
module.exports.parseSEARCHOK = (response, cb) => {
    let responseArr = response.split(" ");

    let status = responseArr[1];

    if (SER_OK === status) {
        let noOfFiles = parseInt(responseArr[2]);

        if (noOfFiles === 0) {
            return 0;
        } else if (noOfFiles === 9999) {
            return 1;
        }

    } else if (ERROR === status) {
        return ERROR;
    }
};