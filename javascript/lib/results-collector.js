let noOfUdpMsgs = 0;
let noOfUdpSentMsgs = 0;
let noOfUdpReceivedMsgs = 0;

let noOfTcpMsgs = 0;
let noOfTcpSentMsgs = 0;
let noOfTcpReceivedMsgs = 0;

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
    noOfTcpReceivedMsgs;
    noOfTcpMsgs++;
};