const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.printf((info) => {
            return `${info.message}`;
        })),
    transports: [
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'full-log.log'})
    ]
});

let FgRed = "\x1b[31m",
    FgYellow = "\x1b[33m",
    FgCyan = "\x1b[36m",
    Reset = "\x1b[0m",
    FgGreen = "\x1b[32m",
    FgMagenta = "\x1b[35m",
    FgWhite = "\x1b[37m";

const printPrefix = "[PRINT]:",
    errorPrefix = "[ERROR]:",
    warningPrefix = "[WARN]:",
    infoPrefix = "[INFO]:",
    okPrefix = "[OK]:",
    wirePrefix = "[WIRE]:",
    debugPrefix = "[DEBUG]:",
    hbPrefix = "[HB]:"
;

let active = {
    print: true,
    error: true,
    warning: true,
    info: true,
    ok: true,
    wire: false,
    debug: true,
    hb: false,
};

const methods = {
    print: (...str) => {
        str.unshift(printPrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.print) {
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    error: (...str) => {
        str.unshift(errorPrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.error) {
            str.unshift(FgRed);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    warning: (...str) => {
        str.unshift(warningPrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.warning) {
            str.unshift(FgYellow);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    info: (...str) => {
        str.unshift(infoPrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.info) {
            str.unshift(FgCyan);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    ok: (...str) => {
        str.unshift(okPrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.ok) {
            str.unshift(FgGreen);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    wire: (...str) => {
        str.unshift(wirePrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.wire) {
            str.unshift(FgMagenta);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    debug: (...str) => {
        str.unshift(debugPrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.debug) {
            str.unshift(FgWhite);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    hb: (...str) => {
        str.unshift(hbPrefix);
        logger.log({level: 'info', message: str.join(' ')});
        if (active.hb) {
            str.unshift(FgYellow);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    activate: (logLevel) => {
        active[logLevel] = true;
    },
};

module.exports = methods;
