const logger = require('./logger');

// protocol
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
const LIVE = "LIVE";
const LIVE_OK = "LIVE_OK";
const DISC = "DISC";
const DISC_OK = "DISC_OK";

// inside server
const REQ = "REQ";
const ACK = "ACK";
const RES = "RES";

// TODO it is better we can export this by module.exports.CONSTS = {}
module.exports = {REQ, ACK, RES, JOIN, JOIN_OK, LIVE, LIVE_OK, DISC, DISC_OK, LEAVE, LEAVE_OK, SER, SER_OK};

// *************** FOR BOOTSTRAP SERVER ******************
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
                    nodes[responseArr[i]+":"+responseArr[i+1]] = {
                        ip: responseArr[i],
                        port: parseInt(responseArr[i + 1])
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
// ****************** ENDS FOR BOOTSTRAP SERVER *********************


// ****************** FOR NODE COMMUNICATION ********************

// UDP MESSAGE FORMAT - length id operation etc
module.exports.generateUDPMsg = (msgSend) => {
    // TODO : message version is not attached
    let message = msgSend.id + " ";

    // TODO: implement other types - SEARCH
    if (JOIN === msgSend.body.type) {
        message += JOIN + " " + msgSend.body.node.ip + " " + msgSend.body.node.port;
    } else if (LEAVE === msgSend.body.type) {
        message += LEAVE + " " + msgSend.body.node.ip + " " + msgSend.body.node.port;
    } else if (ACK === msgSend.body.type) {
        message += ACK;
    } else if (JOIN_OK === msgSend.body.type) {
        if (msgSend.body.success) {
            message += JOIN_OK + " 0";
        } else {
            message += JOIN_OK + " 9999";
        }
    } else if (LEAVE_OK === msgSend.body.type) {
        if (msgSend.body.success) {
            message += LEAVE_OK + " 0";
        } else {
            message += LEAVE_OK + " 9999";
        }
    } else if (LIVE === msgSend.body.type) {
        message += LIVE + ' 1';
    } else if (LIVE_OK === msgSend.body.type) {
        message += LIVE_OK + ' 1';
    } else if (DISC === msgSend.body.type) {
        message += DISC + ' 1';
    } else if (DISC_OK === msgSend.body.type) {
        message += DISC_OK + ' 1 ' + msgSend.body.node.ip + ' ' + msgSend.body.node.port;
    } else if (SER === msgSend.body.type) {
        message += SER + " " + msgSend.body.node.ip + " " + msgSend.body.node.port + " \"" + msgSend.body.searchString + "\" " + msgSend.body.hopCount;
    } else if (SER_OK === msgSend.body.type) {
        let fileNames = msgSend.body.fileNames;
        message += SER_OK + " " + fileNames.length + " " + msgSend.body.node.ip + " " + msgSend.body.node.port + " " + +msgSend.body.hopCount;
        fileNames.forEach(name => {
            message += " \"" + name + "\"";
        });
    } else {
        message += JSON.stringify(msgSend.body);
    }

    // 4 front digits and space = 5
    let packetLength = message.length + 5;
    message = ("000" + packetLength).slice(-4) + " " + message;

    return message;
};

module.exports.parseUDPMsg = (msgReceive, rinfo) => {
    let msgReceiveArr = msgReceive.split(" ");

    let id = msgReceiveArr[1];
    let operation = msgReceiveArr[2];
    let status = parseInt(msgReceiveArr[3]);

    let udpStream = {
        id: id,
        body: {
            node: {}
        }
    };

    udpStream.body.type = operation;

    if (JOIN === operation || LEAVE === operation) {
        udpStream.type = REQ;
        udpStream.body.node.ip = msgReceiveArr[3];
        udpStream.body.node.port = msgReceiveArr[4];
    } else if (ACK === operation) {
        udpStream.type = ACK;
    } else if (JOIN_OK === operation || LEAVE_OK === operation) {
        udpStream.type = RES;
        // for the completeness adds ip and port
        udpStream.body.node.ip = rinfo.address;
        udpStream.body.node.port = rinfo.port;
        if (status === 0) {
            udpStream.body.success = true;
        } else if (status === 9999) {
            udpStream.body.success = false;
        }
    } else if (LIVE === operation) {
        udpStream.type = REQ;
    } else if (LIVE_OK === operation) {
        udpStream.type = RES;
    } else if (DISC === operation) {
        udpStream.type = REQ;
    } else if (DISC_OK === operation) {
        udpStream.type = RES;
        udpStream.body.node.ip = msgReceiveArr[4];
        udpStream.body.node.port = msgReceiveArr[5];
    } else if (SER === operation) {
        udpStream.type = REQ;
        udpStream.body.node.ip = msgReceiveArr[3];
        udpStream.body.node.port = msgReceiveArr[4];
        let searchString = "";
        for (let i = 5; i < msgReceiveArr.length - 1; i++) {
            searchString += msgReceiveArr[i].toString();
        }
        udpStream.body["searchString"] = searchString;
        udpStream.body["hopCount"] = msgReceiveArr[msgReceiveArr.length - 1];
    } else if (SER_OK === operation) {
        udpStream.type = REQ;
        let numberOfFiles = msgReceiveArr[3];
        udpStream.body.node.ip = msgReceiveArr[4];
        udpStream.body.node.port = msgReceiveArr[5];
        udpStream.body["hopCount"] = msgReceiveArr[6];
        let fileNames = [];
        let tempArr = msgReceive.split("\"");
        for (let i = 1; i < tempArr.length; i++) {
            if (tempArr[i] !== " " && tempArr[i] !== "") {
                fileNames.push(tempArr[i].toString());
            }
        }
        udpStream.body["fileNames"] = fileNames;
    } else {
        logger.error('Message Parser : Unhandled UDP stream', udpStream);
    }

    return udpStream;
};

// ****************** DEPRECATED ***********************
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
// ***********************************************