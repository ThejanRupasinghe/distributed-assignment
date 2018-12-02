const stdin = process.openStdin();
const minimist = require('minimist');
const log = require('./logger');

module.exports.init = (commands) => {
    commands.hi = () => {
        log.print('hi welcome you all to this little distributed system');
    };
    commands.cls = () => {
        console.log('\033[2J');
    };
    commands.help = () => {
        console.log(Object.keys(commands));
    };

    stdin.addListener('data', (d) => {
        d = d.toString().trim().split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
        if(commands[d[0]]) {
            // log.info(d);
            commands[d[0]](minimist(d))
        } else {
            log.print('no such command');
        }
    });
};
