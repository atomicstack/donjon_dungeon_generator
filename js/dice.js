// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dice.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var fn = /([a-z]*)\(([^()]*?)\)/,
    dice = /(\d*)d(\d+)/,
    incr = /([+-]?\d+\.\d+|[+-]?\d+)(\+\+|--)/,
    mult = /([+-]?\d+\.\d+|[+-]?\d+)\s*(\*|\/|%)\s*([+-]?\d+\.\d+|[+-]?\d+)/,
    add = /([+-]?\d+\.\d+|[+-]?\d+)\s*(\+|-)\s*([+-]?\d+\.\d+|[+-]?\d+)/,
    fp = /(\d+\.\d\d\d+)/,
    max_dice = 1E3;

function roll_dice(b) {
    for (var a; a = fn.exec(b);) {
        a = rd_fn(a[1], a[2]);
        b = b.replace(fn, a)
    }
    for (; a = dice.exec(b);) {
        a = rd_dice(a[1], a[2]);
        b = b.replace(dice, a)
    }
    for (; a = incr.exec(b);) {
        a = rd_math(a[1], a[2]);
        b = b.replace(incr, a)
    }
    for (; a = mult.exec(b);) {
        a = rd_math(a[1], a[2], a[3]);
        b = b.replace(mult, a)
    }
    for (; a = add.exec(b);) {
        a = rd_math(a[1], a[2], a[3]);
        b = b.replace(add, a)
    }
    for (; a = fp.exec(b);) {
        a = Math.floor(a[1] * 100 + 0.5) / 100;
        b = b.replace(fp, a)
    }
    return b
}

function rd_fn(b, a) {
    a = roll_dice(a);
    if (b == "int") return Math.floor(a);
    else if (b == "round") return Math.floor(a + 0.5);
    else if (b == "sqrt") return Math.sqrt(a);
    return a
}

function rd_dice(b, a) {
    b = parseInt(b);
    if (isNaN(b) || b < 1) b = 1;
    a = parseInt(a);
    if (isNaN(a) || a < 0) return 0;
    if (b > max_dice) return 0;
    var c = 0,
        d;
    for (d = 0; d < b; d++) c += rd_rand(a) + 1;
    return c
}

function rd_rand(b) {
    return Math.floor(Math.random() * 0.9999 * b)
}

function rd_math(b, a, c) {
    b = parseFloat(b);
    if (isNaN(b)) b = 0;
    c = parseFloat(c);
    if (isNaN(c)) c = 0;
    if (a == "++") return ++b;
    if (a == "--") return --b;
    if (a == "*") return b * c;
    if (a == "/") return b / c;
    if (a == "%") return b % c;
    if (a == "+") return b + c;
    if (a == "-") return b - c;
    return 0
};