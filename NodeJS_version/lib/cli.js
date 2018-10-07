const stdin = process.openStdin();
const minimist = require('minimist');
const log = require('./logger');

module.exports.init = (commands) => {
    commands.hi = () => {
        log.print('hi welcome you all to this little distributed system');
    };
    commands.exit = () => {
        process.exit();
    };

    stdin.addListener("data", (d) => {
        d = d.toString().trim().split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
        if(commands[d[0]]) {
            log.info(d);
            commands[d[0]](minimist(d))
        } else {
            log.print('no such command');
        }
    });
};
