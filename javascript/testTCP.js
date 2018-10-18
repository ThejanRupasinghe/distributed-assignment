const tcp = require('./lib/tcp-message');
const logger = require('./lib/logger');

let bsAddress = {
    ip: '0.0.0.0',
    port: 5051
};

tcp.init(bsAddress.ip, bsAddress.port);

tcp.sendMessage("0034 REG 129.82.123.45 5001 1234ab", (data)=>{
    logger.info(data+"");
});