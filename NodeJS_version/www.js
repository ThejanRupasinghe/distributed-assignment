const log = require('./lib/logger');
module.exports.start  = (app, port) => {
    return app.listen(port, (err) => {
        if (err) {
            return log.error('something bad happened', err)
        }
        log.print(`server is listening on ${port}`)
    });
};
