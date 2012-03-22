function padZero(number) {
    var n = String(number);
    if (number < 10) {
        n = '0' + n;
    }
    return n;
}

function pad2Zeros(number) {
    var n = String(number);
    if (number < 10) {
        n = '00' + n;
    } else if (number < 100) {
        n = '0' + n;
    }
    return n;
}

var daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var daysOfWeekLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
                     'Thursday', 'Friday', 'Saturday'];
var monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthsLong = ['January', 'Feburary', 'March', 'April',
                    'May', 'June', 'July', 'August', 'September',
                    'October', 'November', 'December'];

var dateFormatMap = {
    //if they did %%, we give 'em %
    '%' : function (d) { return '%'; },
    //otherwise, give 'em the woiks

    'l' : function (d) { return pad2Zeros(d.getMilliseconds()); },

    'S' : function (d) { return padZero(d.getSeconds()); },

    'M' : function (d) { return padZero(d.getMinutes()); },

    'H' : function (d) { return padZero(d.getHours()); },
    'I' : function (d) {
        var h = d.getHours(),
            nh = h % 12;
        h = nh == 0 ? 12 : nh;
        return padZero(h);
    },
    'p' : function (d) {return d.getHours() > 11 ? 'PM' : 'AM'; },

    'd' : function (d) { return padZero(d.getDate()); },
    'w' : function (d) { return padZero(d.getDay()); },
    'a' : function (d) { return daysOfWeekShort[d.getDay()]; },
    'A' : function (d) { return daysOfWeekLong[d.getDay()]; },
    'j' : function (d) { return padZero(d.getDate()); },

    'm' : function (d) { return padZero(d.getMonth() + 1); },
    'b' : function (d) { return monthsShort[d.getMonth()]; },
    'B' : function (d) { return monthsLong[d.getMonth()]; },

    'y' : function (d) { return d.getFullYear(); },
    'Y' : function (d) { return d.getFullYear() % 100; },

    'z' : function (d) {
        var o = d.getTimezoneOffset(),
            mins = o % 60,
            hrs = (o - mins) / 60,
            res = padZero(hrs) +  padZero(o % 60);
        if (o > -1) {
          return '+' + res;
        }
        return res;
    }
};

function getDate(format) {
    var d = new Date(),
        res = '',
        isFmt = false,
        c = null,
        i;

    for (i = 0; i < format.length; ++i) {
        c = format[i];
        if (isFmt) {
            isFmt = false;
            res = res + dateFormatMap[c](d);
        } else if (c == '%') {
            isFmt = true;
        } else {
            res = res + c;
        }
    }
    return res;
}

exports.getDate = getDate;
