// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// prng.js
// seeded pseudo-random number generator
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var seed = Date.now();

function init_seed(a) {
    return seed = typeof a == "number" ? Math.floor(a) : typeof a == "string" ? hash_string(42, a) : Date.now()
}

function hash_string(a, c) {
    var b;
    for (b = 0; b < c.length; b++) {
        a = (a << 5) - a + c.charCodeAt(b);
        a &= 2147483647
    }
    return a
}

function random(a) {
    seed = 1103515245 * seed + 12345;
    seed &= 2147483647;
    return a > 1 ? (seed >> 8) % a : 0
};