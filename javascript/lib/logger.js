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

const active = {
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
        if (active.print) {
            str.unshift(printPrefix);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    error: (...str) => {
        if (active.error) {
            str.unshift(errorPrefix);
            str.unshift(FgRed);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    warning: (...str) => {
        if (active.warning) {
            str.unshift(warningPrefix);
            str.unshift(FgYellow);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    info: (...str) => {
        if (active.info) {
            str.unshift(infoPrefix);
            str.unshift(FgCyan);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    ok: (...str) => {
        if (active.ok) {
            str.unshift(okPrefix);
            str.unshift(FgGreen);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    wire: (...str) => {
        if (active.wire) {
            str.unshift(wirePrefix);
            str.unshift(FgMagenta);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    debug: (...str) => {
        if (active.debug) {
            str.unshift(debugPrefix);
            str.unshift(FgWhite);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    hb: (...str) => {
        if (active.hb) {
            str.unshift(hbPrefix);
            str.unshift(FgYellow);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
};

module.exports = methods;
