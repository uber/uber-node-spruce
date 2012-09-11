var spruce = require('../lib/spruce.js');
var logger = spruce.logger(module, true);

function testThemAll(){
    console.log ('\n---- Testing all the functions ---- ');
    for (var level in logger) {
        logger[level]('this is a ' + level);
        logger[level]('this \nis \n\ra\r stupid \rdarn\r' + level + ' with newlines.');
	logger[level]('this is a printf-style %s for "C"ool Dudes.', level);
    }
    console.log ('---- Done testing  ---- \n');
}

testThemAll();

logger = spruce.init();

testThemAll();

var opts = {
    useColor: true,
    dateFormat: '[%A, %B %d %y, %I:%M:%S.%l %p]',
    stripNewlines: false,
    methods: {
        trace: {color : 30},
        debug: {color: 33},
        info: {color: 34},
        warn: {color: 35},
        extra: {color: 42},
        catastrophic: {
            lineNum: true},
        error: {
            color: 36,
            handlers: [
                function (msg) {
                    console.log('Emailing about "' + msg + '"');
                }
            ],
        },
    },
    moduleName: 'fancyPants',
};

logger = spruce.init(opts);

testThemAll();

logger = spruce.init({
    methods: {
        debug: {
            lineNum: false
        },
        info: {
            lineNum: true
        }
    },
    moduleName: 'fancyPants'
});

testThemAll();
