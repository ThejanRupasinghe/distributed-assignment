const logger = require('./logger');

const REG = "REG";
const REG_OK = "REGOK";
const ERROR = "ERROR";


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
                cb(nodes, null);
                break;
            case 9999:
            case 9998:
            case 9997:
                cb(null, noOfNodes);
                break;
            default:
                for (let i = 3; i <= noOfNodes * 3; i += 3) {
                    nodes[responseArr[i + 2]] = {
                        ipAddr: responseArr[i],
                        port: parseInt(responseArr[i + 1]),
                    };
                }
                cb(nodes, null);
                break;
        }

    } else if (ERROR === status) {
        cb(null, ERROR);
    }

};