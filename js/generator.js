// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generator.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
function generate_text(a) {
    if (a = gen_data[a])
        if (a = select_from(a)) {
            var c = new_trace();
            return expand_tokens(a, c)
        }
    return ""
}

function select_from(a) {
    return a.constructor == Array ? select_from_array(a) : select_from_table(a)
}

function select_from_array(a) {
    return a[random(a.length)]
}

function select_from_table(a) {
    var c;
    if (c = scale_table(a)) {
        c = random(c) + 1;
        var b;
        for (b in a) {
            var d = key_range(b);
            if (c >= d[0] && c <= d[1]) return a[b]
        }
    }
    return ""
}

function scale_table(a) {
    var c = 0,
        b;
    for (b in a) {
        var d = key_range(b);
        if (d[1] > c) c = d[1]
    }
    return c
}

function key_range(a) {
    var c;
    return (c = /(\d+)-00/.exec(a)) ? [parseInt(c[1], 10), 100] : (c = /(\d+)-(\d+)/.exec(a)) ? [parseInt(c[1], 10), parseInt(c[2], 10)] : a == "00" ? [100, 100] : [parseInt(a, 10), parseInt(a, 10)]
}

function new_trace() {
    return {
        exclude: {},
        "var": {}
    }
}

function local_trace(a) {
    var c = Object.clone(a);
    c["var"] = Object.clone(a["var"]);
    return c
}

function expand_tokens(a, c) {
    for (var b = /\${ ([^{}]+) }/, d; d = b.exec(a);) {
        d = d[1];
        var e;
        a = (e = expand_token(d, c)) ? a.replace("${ " + d + " }", e) : a.replace("{" + d + "}", d)
    }
    return a
}

function expand_token(a, c) {
    var b, d;
    if (b = /^\d*d\d+/.exec(a)) return roll_dice(b[1]);
    else if (b = /^calc (.+)/.exec(a)) return roll_dice(b[1]);
    else if (b = /^(\d+) x (.+)/.exec(a)) return expand_x(b[1], b[2], c);
    else if (b = /^\[ (.+) \]/.exec(a)) {
        d = b[1].split(/,\s*/);
        return expand_tokens(select_from_array(d), c)
    } else if (d = gen_data[a]) return expand_tokens(select_from(d), c);
    else if (b = /^alt (.+) def (.+)/.exec(a)) return (d = gen_data[b[1]]) ? expand_tokens(select_from(d), c) : (d = gen_data[b[2]]) ? expand_tokens(select_from(d),
        c) : b[2];
    else if (b = /^unique (.+)/.exec(a)) return expand_unique(b[1], c);
    else if (b = /^local (.+)/.exec(a)) {
        a = local_trace(c);
        return expand_token(b[1], a)
    } else if (b = /^new (.+)/.exec(a)) {
        a = new_trace();
        return expand_token(b[1], a)
    } else if (b = /^set (\w+) = (.+?) in (.+)/.exec(a)) {
        c["var"][b[1]] = b[2];
        return expand_token(b[3], c)
    } else if (b = /^set (\w+) = (.+)/.exec(a)) return set_var(b[1], b[2], c);
    else if (b = /^get (\w+) def (.+)/.exec(a)) return c["var"][b[1]] || b[2];
    else if (b = /^get (\w+) fix (.+)/.exec(a)) return c["var"][b[1]] ||
        set_var(b[1], b[2], c);
    else if (b = /^get (\w+)/.exec(a)) return c["var"][b[1]];
    else if (b = /^shift (\w+) = (.+)/.exec(a)) {
        c["var"][b[1]] = b[2].split(/,\s*/);
        return c["var"][b[1]].shift()
    } else if (b = /^shift (\w+)/.exec(a)) return c["var"][b[1]].shift();
    else if (b = /^an (.+)/.exec(a)) return aoran(expand_token(b[1], c));
    else if (b = /^An (.+)/.exec(a)) return ucfirst(aoran(expand_token(b[1], c)));
    else if (b = /^nt (.+)/.exec(a)) return nothe(expand_token(b[1], c));
    else if (b = /^lc (.+)/.exec(a)) return lc(expand_token(b[1], c));
    else if (b = /^lf (.+)/.exec(a)) return inline_case(expand_token(b[1], c));
    else if (b = /^lt (.+)/.exec(a)) return lthe(expand_token(b[1], c));
    else if (b = /^uc (.+)/.exec(a)) return uc(expand_token(b[1], c));
    else if (b = /^uf (.+)/.exec(a)) return ucfirst(expand_token(b[1], c));
    else if (b = /^sc (.+)/.exec(a)) return ucfirst(lc(expand_token(b[1], c)));
    else if (b = /^tc (.+)/.exec(a)) return title_case(expand_token(b[1], c));
    else if (b = /^gen_name (.+)/.exec(a)) {
        b = b[1].replace(/,.*/, "");
        return generate_name(b)
    }
    return a
}

function expand_x(a, c, b) {
    for (var d = {}, e = [], i = b.comma || ", "; match = /^(and|literal|unique) (.+)/.exec(c);) {
        opt[match[1]] = true;
        c = match[2]
    }
    var h;
    for (h = 0; h < a; h++) {
        var f = new String(c);
        f = opt.unique ? expand_unique(f, b) : expand_token(f, b);
        if (opt.literal) e.push(f);
        else if (match = /^(\d+) x (.+)/) d[match[2]] += parseInt(match[1], 10);
        else d[f] += 1
    }
    $H(d).keys().sort().each(function(g) {
        d[g] > 1 ? e.push([d[g], g].join(" x ")) : e.push(g)
    });
    if (opt.and) {
        a = e.pop();
        return e.length ? [e.join(i), a].join(" and ") : a
    } else return e.join(i)
}

function expand_unique(a, c) {
    var b;
    for (b = 0; b < 100; b++) {
        var d = expand_token(a, c);
        if (!c.exclude[d]) {
            c.exclude[d] = true;
            return d
        }
    }
    return ""
}

function set_var(a, c, b) {
    if (a == "npc_name") b["var"].name = (match = /^(.+?) .+/.exec(c)) ? match[1] : c;
    return b["var"][a] = c
}

function aoran(a) {
    return /^the /i.test(a) ? a : /^(nunchaku)/i.test(a) ? a : /^(unicorn|unique|university)/i.test(a) ? "a " + a : /^(hour)/i.test(a) ? "an " + a : /^[BCDGJKPQTUVWYZ][A-Z0-9]+/.test(a) ? "a " + a : /^[AEFHILMNORSX][A-Z0-9]+/.test(a) ? "an " + a : /^[aeiou]/i.test(a) ? "an " + a : "a " + a
}

function nothe(a) {
    return (match = /^the (.+)/i.exec(a)) ? match[1] : a
}

function lc(a) {
    return a.toLowerCase()
}

function lcfirst(a) {
    return (match = /^([a-z])(.*)/i.exec(a)) ? lc(match[1]) + match[2] : a
}

function inline_case(a) {
    return /^[A-Z][A-Z]/.test(a) ? a : lcfirst(a)
}

function lthe(a) {
    return (match = /^the (.+)/i.exec(a)) ? "the " + match[1] : a
}

function uc(a) {
    return a.toUpperCase()
}

function ucfirst(a) {
    return (match = /^([a-z])(.*)/i.exec(a)) ? uc(match[1]) + match[2] : a
}

function title_case(a) {
    return a.split(/\s+/).map(uc).join(" ")
};