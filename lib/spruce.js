/*
    spruce : a node logging library
    Copyright (c) 2011 by Mark P Neyer, Uber Technologies

    based upon:
        node-logger library
        http://github.com/igo/node-logger

        Copyright (c) 2010 by Igor Urmincek

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

var sys = require('sys');
var getDate = require('./date_utils').getDate;

function getCallerLine(moduleName) {
    //make an error to get the line number
    var e = new Error(),
        line = e.stack.split('\n')[4],
        parts = line.split('/'),
        last_part = parts[parts.length - 1],
        file_name = last_part.substring(0, last_part.length - 1);
    if (moduleName) {
        return moduleName + ' (' + file_name + ')';
    }
    return file_name;
}
function getMessage(msg) {
    var res = null;
    if (typeof msg === 'string') {
        res = msg;
    } else {
        res = sys.inspect(msg, false, 10);
    }
    return res;
}

var defaultOptions = {
    dateFormat : '[%y-%m-%d %H:%M:%S.%l]',
    stripNewlines : true,
    methods : {
        info : {
            lineNum : false,
            color : 30,
            handlers: []
        },
        trace : {
            lineNum : true,
            color : 30,
            handlers: []
        },
        debug : {
            lineNum : true,
            color : 34,
            handlers : []
        },
        warn : {
            lineNum : true,
            color : 35,
            handlers : []
        },
        error: {
            lineNum : true,
            color :  31,
            handlers : []
        }
    },
    moduleName : null,
    useColor : false
};

function applyDefaults(given, defaults) {
    var dude,
        res = {},
        validTypes = {
            'function': true,
            'boolean' : true,
            'number' : true,
            'string' : true
        };

    //go through all the default values for this option
    //and make sure those are all populated
    for (dude in defaults) {
        if (defaults.hasOwnProperty(dude)) {
            if (typeof given[dude] === 'undefined') {
                res[dude] = defaults[dude];
            } else if (validTypes[typeof defaults[dude]] || defaults[dude] == null) {
                res[dude] = given[dude];
            } else {
                res[dude] = applyDefaults(given[dude], defaults[dude]);
            }
        }
    }
    //now add in the extra stuff that they supplied
    if (given) {
        if (Array.isArray(defaults)) {
            res = [];
        }
        for (dude in given) {
            if (given.hasOwnProperty(dude) && !defaults[dude]) {
                res[dude] = given[dude];
            }
        }
    }

    //now apply all the nondefaults
    return res;
}
function init(opts) {
    //apply our defaults to the options
    //using the handy applyDefaults above
    //kaPOW
    if (typeof opts === 'undefined') {
        opts = defaultOptions;
    } else {
        opts = applyDefaults(opts, defaultOptions);
    }
    //this is the object we return
    //it will only contain functions
    var level,
        logger = {},
        defineMethod = function (level) {
            var levelStr = level.toUpperCase(),
                color = opts.methods[level].color,
                handlers = opts.methods[level].handlers,
                getStringContent = function (msg) {
                    var log_msg = getMessage(msg),
                        strArr = [];

                    if (opts.stripNewlines) {
                        log_msg = log_msg.replace(/\n/g, '').replace(/\r/g, '');
                    }

                    strArr.push(getDate(opts.dateFormat));
                    strArr.push(levelStr);

                    if (opts.methods[level].lineNum === true) {
                        strArr.push("[");
                        strArr.push(getCallerLine(opts.moduleName));
                        strArr.push("]");
                    }

                    strArr.push("-");
                    strArr.push(log_msg);

                    return strArr.join(" ");
                },
                runHandlers = typeof handlers ===  'undefined' ? function () {} : function (msg) {
                    var h;
                    for (h = 0; h < handlers.length; ++h) {
                        handlers[h](msg);
                    }
                };

            if (levelStr.length === 4) {
                levelStr += ' ';
            }

            if (opts.useColor && color) {
                logger[level] = function (msg) {
                    sys.puts('\x1B[' + color + 'm' + getStringContent(msg) +  '\x1B[0m');
                    runHandlers(msg);
                };
            } else {
                logger[level] = function (msg) {
                    sys.puts(getStringContent(msg));
                    runHandlers(msg);
                };
            }
        };

    for (level in opts.methods) {
        if (opts.methods.hasOwnProperty(level)) {
            defineMethod(level);
        }
    }

    return logger;
}

exports.logger = function (module, useColor) {
    var opts = applyDefaults({
            useColor: true,
            moduleName : module.name
        },
        defaultOptions);

    return init(opts);
};

exports.init = init;
