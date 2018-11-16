let FgRed = "\x1b[31m", FgYellow = "\x1b[33m", FgCyan = "\x1b[36m", Reset = "\x1b[0m", FgGreen = "\x1b[32m", FgMagenta = "\x1b[35m";

const active = {
    print: true,
    error: true,
    warning: true,
    info: true,
    ok: true,
    debug: false,
};

const methods = {
    print: (...str) => {
        if(active.print) {
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    error: (...str) => {
        if(active.error) {
            str.unshift(FgRed);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    warning: (...str) => {
        if(active.warning) {
            str.unshift(FgYellow);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    info: (...str) => {
        if(active.info) {
            str.unshift(FgCyan);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    ok: (...str) => {
        if(active.ok) {
            str.unshift(FgGreen);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    },
    debug: (...str)=>{
        if(active.debug){
            str.unshift(FgMagenta);
            str.push(Reset);
            console.log.apply(console, Array.prototype.slice.call(str));
        }
    }
};

module.exports = methods;
