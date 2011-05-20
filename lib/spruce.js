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

function getCallerLine(moduleName, cCons) {
    //make an error to get the line number
    var e = new Error();
    // in case of custum console, the stack trace is one item longer
    var splitNum = cCons ? 5 : 4
    var line = e.stack.split('\n')[splitNum];
    var parts = line.split('/');
    var last_part = parts[parts.length -1];
    var file_name = last_part.substring(0,last_part.length-1);
    if (moduleName)
        return moduleName + ' ('+file_name+')';
    return file_name;
}
function getMessage(msg) {
    if (typeof msg == 'string') {
        return msg;
    } else {
        return sys.inspect(msg, false, 10);
    }
}

var defaultOptions = {
            
            'dateFormat' : '[%m-%d-%y %H:%M:%S.%l]',
            'methods' : {
                'info' : {'lineNum' : false,
                            'color' : 30,
                            'handlers': []},
                'trace' : {'lineNum' : true,
                            'color' : 30,
                            'handlers': []},
                'debug' : {'lineNum' : true,
                            'color' : 34,
                            'handlers' : []},
                'warn' : {'lineNum' : true,
                         'color' : 35,
                        'handlers' : []},
                'error': {'lineNum' : true,
                          'color' :  31,
                          'handlers' : []},
                },
            'moduleName' : null,
            'useColor' : false,
};

function applyDefaults(given, defaults){
    var res = {};

    //go through all the default values for this option
    //and make sure those are all populated
    for (var dude in defaults){
        if (typeof given[dude] === 'undefined'){
            res[dude] = defaults[dude];
        } else if (typeof defaults[dude] in {'function': true,
                                              'boolean' : true,
                                              'number' : true,
                                              'string' : true}
                                           || defaults[dude] == null ){
            res[dude] = given[dude]; 
        } else {
            res[dude] = applyDefaults(given[dude],
                                    defaults[dude]);
        }
    }
    //now add in the extra stuff that they supplied
    if (given){
        for (var dude in given){
            if (!(dude in defaults)){
                res[dude] = given[dude];
            }
        }
    }


    //now apply all the nondefaults
    return res;
}
function init (opts) {
    //apply our defaults to the options
    //using the handy applyDefaults above
    //kaPOW
    if (typeof opts === 'undefined')
        opts = defaultOptions;
    else
        opts = applyDefaults(opts, defaultOptions);
    //this is the object we return
    //it will only contain functions
    var logger = {};

    var defineMethod = function(level) {
        var levelStr = level.toUpperCase();
        if (levelStr.length == 4) levelStr += ' ';
        var color = opts.methods[level].color;

        var cConsole = opts.methods[level].custumConsole;
        var getStringContent = function(msg){
            return  getDate(opts.dateFormat) + ' ' + levelStr + ' ['+ 
                getCallerLine(opts.moduleName, cConsole) + '] - ' + getMessage(msg)
        }
        
        var colorize = function(str) {
            if (opts.useColor && color) {
                return '\x1B[' + color + 'm' + str +  '\x1B[0m';
            } else {
                return str;
            }
        }

        var exposedFns = {}
        exposedFns.colorize = colorize 
        exposedFns.getStringContent = getStringContent 

        var stream = opts.methods[level].writableStream;
        var streamHandler = opts.methods[level].streamHandler;
        var handlers = opts.methods[level].handlers;
        var runHandlers = function(msg){
            if ('function' == typeof streamHandler) {
                stream.write(streamHandler.call(exposedFns, msg))
            }else{
                stream.write(msg)
            }
            for (var h = 0; h < handlers.length; ++h){
                handlers[h].call(exposedFns, msg);
            }
        }

        if ('function' == typeof cConsole) {
            logger[level] = function(msg) {
                cConsole.call(exposedFns, msg)
                runHandlers(msg);
            };
        } else {
            logger[level] = function(msg) {
                sys.puts( colorize(getStringContent(msg)) );
                runHandlers(msg);
            };
        }
    }
    
    for (var level in opts.methods) {
            defineMethod(level);
    }
    return logger;
}

exports.logger = function (module, useColor) { 
    var opts = applyDefaults({'useColor' : true,
                              'moduleName' : module.name},
                         defaultOptions);
    console.log('opts');
    return init(opts); 
};
exports.init = init;
