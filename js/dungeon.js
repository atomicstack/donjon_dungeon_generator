// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dungeon.js // version 1.0.2
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
var dc = {
        map_style: {
            standard: {
                title: "Standard"
            },
            classic: {
                title: "Classic"
            },
            graph: {
                title: "GraphPaper"
            }
        },
        grid: {
            none: {
                title: "None"
            },
            square: {
                title: "Square"
            },
            hex: {
                title: "Hex"
            },
            vex: {
                title: "VertHex"
            }
        },
        dungeon_layout: {
            square: {
                title: "Square",
                aspect: 1
            },
            rectangle: {
                title: "Rectangle",
                aspect: 1.3
            },
            box: {
                title: "Box",
                aspect: 1,
                mask: [
                    [1, 1, 1],
                    [1, 0, 1],
                    [1, 1, 1]
                ]
            },
            cross: {
                title: "Cross",
                aspect: 1,
                mask: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ]
            },
            dagger: {
                title: "Dagger",
                aspect: 1.3,
                mask: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 1, 0],
                    [0, 1, 0]
                ]
            },
            saltire: {
                title: "Saltire",
                aspect: 1
            },
            keep: {
                title: "Keep",
                aspect: 1,
                mask: [
                    [1, 1, 0, 0, 1, 1],
                    [1, 1, 1, 1, 1, 1],
                    [0, 1, 1, 1, 1, 0],
                    [0, 1, 1, 1, 1, 0],
                    [1, 1, 1, 1, 1, 1],
                    [1, 1, 0, 0, 1, 1]
                ]
            },
            hexagon: {
                title: "Hexagon",
                aspect: 0.9
            },
            round: {
                title: "Round",
                aspect: 1
            }
        },
        dungeon_size: {
            fine: {
                title: "Fine",
                size: 200,
                cell: 18
            },
            dimin: {
                title: "Diminiutive",
                size: 252,
                cell: 18
            },
            tiny: {
                title: "Tiny",
                size: 318,
                cell: 18
            },
            small: {
                title: "Small",
                size: 400,
                cell: 18
            },
            medium: {
                title: "Medium",
                size: 504,
                cell: 18
            },
            large: {
                title: "Large",
                size: 635,
                cell: 18
            },
            huge: {
                title: "Huge",
                size: 800,
                cell: 18
            },
            gargant: {
                title: "Gargantuan",
                size: 1008,
                cell: 18
            },
            colossal: {
                title: "Colossal",
                size: 1270,
                cell: 18
            }
        },
        add_stairs: {
            no: {
                title: "No"
            },
            yes: {
                title: "Yes"
            },
            many: {
                title: "Many"
            }
        },
        room_layout: {
            sparse: {
                title: "Sparse"
            },
            scattered: {
                title: "Scattered"
            },
            dense: {
                title: "Dense"
            }
        },
        room_size: {
            small: {
                title: "Small",
                size: 2,
                radix: 2
            },
            medium: {
                title: "Medium",
                size: 2,
                radix: 5
            },
            large: {
                title: "Large",
                size: 5,
                radix: 2
            },
            huge: {
                title: "Huge",
                size: 5,
                radix: 5,
                huge: 1
            },
            gargant: {
                title: "Gargantuan",
                size: 8,
                radix: 5,
                huge: 1
            },
            colossal: {
                title: "Colossal",
                size: 8,
                radix: 8,
                huge: 1
            }
        },
        doors: {
            none: {
                title: "None"
            },
            basic: {
                title: "Basic"
            },
            secure: {
                title: "Secure"
            },
            standard: {
                title: "Standard"
            },
            deathtrap: {
                title: "Deathtrap"
            }
        },
        corridor_layout: {
            labyrinth: {
                title: "Labyrinth",
                pct: 0
            },
            errant: {
                title: "Errant",
                pct: 50
            },
            straight: {
                title: "Straight",
                pct: 90
            }
        },
        remove_deadends: {
            none: {
                title: "None",
                pct: 0
            },
            some: {
                title: "Some",
                pct: 50
            },
            all: {
                title: "All",
                pct: 100
            }
        }
    },
    default_query = {
        map_style: "classic",
        grid: "square",
        dungeon_layout: "box",
        dungeon_size: "large",
        add_stairs: "many",
        room_layout: "scattered",
        room_size: "medium",
        doors: "basic",
        corridor_layout: "straight",
        remove_deadends: "all"
    },
    NOTHING = 0,
    BLOCKED = 1,
    ROOM = 2,
    CORRIDOR = 4,
    PERIMETER = 16,
    ENTRANCE = 32,
    ROOM_ID = 65472,
    ARCH = 65536,
    DOOR = 131072,
    LOCKED = 262144,
    TRAPPED = 524288,
    SECRET = 1048576,
    PORTC = 2097152,
    STAIR_DN = 4194304,
    STAIR_UP = 8388608,
    LABEL = 4278190080,
    OPENSPACE = ROOM | CORRIDOR,
    DOORSPACE = ARCH | DOOR | LOCKED | TRAPPED | SECRET | PORTC,
    ESPACE = ENTRANCE | DOORSPACE | 4278190080,
    STAIRS = STAIR_DN | STAIR_UP,
    BLOCK_ROOM = BLOCKED | ROOM,
    BLOCK_CORR = BLOCKED | PERIMETER | CORRIDOR,
    BLOCK_DOOR = BLOCKED | DOORSPACE,
    di = {
        north: -1,
        south: 1,
        west: 0,
        east: 0
    },
    dj = {
        north: 0,
        south: 0,
        west: -1,
        east: 1
    },
    dj_dirs = $H(dj).keys().sort(),
    opposite = {
        north: "south",
        south: "north",
        west: "east",
        east: "west"
    };

function init_form() {
    $("dungeon_name").observe("change", name_reaction);
    $("new_name").observe("click", new_name);
    $H(dc).keys().each(function(a) {
        $H(dc[a]).keys().each(function(b) {
            var c = dc[a][b].title;
            $(a).insert(create_option(b, c))
        });
        $(a).observe("change", new_dungeon)
    });
    $H(default_query).keys().each(function(a) {
        $(a).setValue(default_query[a])
    });
    new_name()
}

function create_option(a, b) {
    return new_option({
        value: a
    }).update(b)
}

function new_option(a) {
    return build_tag("option", a)
}

function build_tag(a, b) {
    return new Element(a, b)
}

function new_name() {
    $("dungeon_name").setValue(generate_text("Dungeon Name"));
    name_reaction()
}

function name_reaction() {
    $("dungeon_title").update($("dungeon_name").getValue());
    new_dungeon()
}

function new_dungeon() {
    var a = create_dungeon();
    image_dungeon(a)
}

function create_dungeon() {
    var a = init_dungeon();
    a = emplace_rooms(a);
    a = open_rooms(a);
    a = label_rooms(a);
    a = corridors(a);
    if (a.add_stairs) a = emplace_stairs(a);
    return a = gelatinous_cube(a)
}

function init_dungeon() {
    var a = {
        seed: init_seed($("dungeon_name").getValue())
    };
    $H(dc).keys().each(function(g) {
        a[g] = $(g).getValue()
    });
    var b = get_dc("dungeon_size", a),
        c = get_dc("dungeon_layout", a),
        d = b.size,
        e = c.aspect;
    b = b.cell;
    a.n_i = Math.floor(d * e / b);
    a.n_j = Math.floor(d / b);
    a.cell_size = b;
    a.n_rows = a.n_i * 2;
    a.n_cols = a.n_j * 2;
    a.max_row = a.n_rows - 1;
    a.max_col = a.n_cols - 1;
    a.cell = [];
    for (d = 0; d <= a.n_rows; d++) {
        a.cell[d] = [];
        for (e = 0; e <= a.n_cols; e++) a.cell[d][e] = NOTHING
    }
    if (c = c.mask) a = mask_cells(a, c);
    else if (a.dungeon_layout ==
        "saltire") a = saltire_mask(a);
    else if (a.dungeon_layout == "hexagon") a = hex_mask(a);
    else if (a.dungeon_layout == "round") a = round_mask(a);
    return a
}

function get_dc(a, b) {
    return dc[a][b[a]]
}

function mask_cells(a, b) {
    var c = b.length / (a.n_rows + 1),
        d = b[0].length / (a.n_cols + 1),
        e;
    for (e = 0; e <= a.n_rows; e++) {
        var g = b[Math.floor(e * c)],
            f;
        for (f = 0; f <= a.n_cols; f++) g[Math.floor(f * d)] || (a.cell[e][f] = BLOCKED)
    }
    return a
}

function saltire_mask(a) {
    Math.floor(a.n_rows / 2);
    var b = Math.floor(a.n_rows / 4),
        c;
    for (c = 0; c < b; c++) {
        var d = b + c,
            e = a.n_cols - d;
        for (d = d; d <= e; d++) {
            a.cell[c][d] = BLOCKED;
            a.cell[a.n_rows - c][d] = BLOCKED;
            a.cell[d][c] = BLOCKED;
            a.cell[d][a.n_cols - c] = BLOCKED
        }
    }
    return a
}

function hex_mask(a) {
    var b = Math.floor(a.n_rows / 2),
        c;
    for (c = 0; c <= a.n_rows; c++) {
        var d = Math.floor(Math.abs(c - b) * 0.57735) + 1,
            e = a.n_cols - d,
            g;
        for (g = 0; g <= a.n_cols; g++)
            if (g < d || g > e) a.cell[c][g] = BLOCKED
    }
    return a
}

function round_mask(a) {
    var b = a.n_rows / 2,
        c = a.n_cols / 2,
        d;
    for (d = 0; d <= a.n_rows; d++) {
        var e = Math.pow(d / b - 1, 2),
            g;
        for (g = 0; g <= a.n_cols; g++) {
            var f = Math.sqrt(e + Math.pow(g / c - 1, 2));
            if (f > 1) a.cell[d][g] = BLOCKED
        }
    }
    return a
}

function emplace_rooms(a) {
    var b = get_dc("room_size", a),
        c = get_dc("room_layout", a);
    a.huge_rooms = b.huge;
    a.complex_rooms = c.complex;
    a.n_rooms = 0;
    a.room = [];
    return a = a.room_layout == "dense" ? dense_rooms(a) : scatter_rooms(a)
}

function scatter_rooms(a) {
    var b = alloc_rooms(a),
        c;
    for (c = 0; c < b; c++) a = emplace_room(a);
    if (a.huge_rooms) {
        b = alloc_rooms(a, "medium");
        for (c = 0; c < b; c++) {
            var d = {
                size: "medium"
            };
            a = emplace_room(a, d)
        }
    }
    return a
}

function alloc_rooms(a, b) {
    a = a;
    var c = b || a.room_size;
    b = a.n_cols * a.n_rows;
    var d = dc.room_size[c];
    c = d.size || 2;
    d = d.radix || 5;
    c = c + d + 1;
    c = c * c;
    b = Math.floor(b / c) * 2;
    if (a.room_layout == "sparse") b /= 13;
    return b
}

function dense_rooms(a) {
    var b;
    for (b = 0; b < a.n_i; b++) {
        var c = b * 2 + 1,
            d;
        for (d = 0; d < a.n_j; d++) {
            var e = d * 2 + 1;
            if (!(a.cell[c][e] & ROOM))
                if (!((b == 0 || d == 0) && random(2) > 0)) {
                    var g = {
                        i: b,
                        j: d
                    };
                    a = emplace_room(a, g);
                    if (a.huge_rooms)
                        if (!(a.cell[c][e] & ROOM)) {
                            g = {
                                i: b,
                                j: d,
                                size: "medium"
                            };
                            a = emplace_room(a, g)
                        }
                }
        }
    }
    return a
}

function emplace_room(a, b) {
    a = a;
    if (a.n_rooms == 999) return a;
    var c = b || {};
    c = set_room(a, c);
    b = c.i * 2 + 1;
    var d = c.j * 2 + 1,
        e = (c.i + c.height) * 2 - 1,
        g = (c.j + c.width) * 2 - 1;
    if (b < 1 || e > a.max_row) return a;
    if (d < 1 || g > a.max_col) return a;
    var f = sound_room(a, b, d, e, g);
    if (f.blocked) return a;
    f = $H(f).keys();
    var h = f.length;
    if (h == 0) {
        f = a.n_rooms + 1;
        a.n_rooms = f
    } else if (h == 1)
        if (a.complex_rooms) {
            f = f[0];
            if (f != c.complex_id) return a
        } else return a;
    else return a;
    for (h = b; h <= e; h++) {
        var i;
        for (i = d; i <= g; i++) {
            if (a.cell[h][i] & ENTRANCE) a.cell[h][i] &=
                ~ESPACE;
            else if (a.cell[h][i] & PERIMETER) a.cell[h][i] &= ~PERIMETER;
            a.cell[h][i] |= ROOM | f << 6
        }
    }
    h = (e - b + 1) * 10;
    i = (g - d + 1) * 10;
    c = {
        id: f,
        size: c.size,
        row: b,
        col: d,
        north: b,
        south: e,
        west: d,
        east: g,
        height: h,
        width: i,
        door: {
            north: [],
            south: [],
            west: [],
            east: []
        }
    };
    if (h = a.room[f])
        if (h.complex) h.complex.push(c);
        else {
            complex = {
                complex: [h, c]
            };
            a.room[f] = complex
        }
    else a.room[f] = c;
    for (h = b - 1; h <= e + 1; h++) {
        a.cell[h][d - 1] & (ROOM | ENTRANCE) || (a.cell[h][d - 1] |= PERIMETER);
        a.cell[h][g + 1] & (ROOM | ENTRANCE) || (a.cell[h][g + 1] |= PERIMETER)
    }
    for (i = d - 1; i <=
        g + 1; i++) {
        a.cell[b - 1][i] & (ROOM | ENTRANCE) || (a.cell[b - 1][i] |= PERIMETER);
        a.cell[e + 1][i] & (ROOM | ENTRANCE) || (a.cell[e + 1][i] |= PERIMETER)
    }
    return a
}

function set_room(a, b) {
    b.size || (b.size = a.room_size);
    var c = dc.room_size[b.size],
        d = c.size || 2;
    c = c.radix || 5;
    if (!("height" in b))
        if ("i" in b) {
            var e = a.n_i - d - b.i;
            if (e < 0) e = 0;
            e = e < c ? e : c;
            b.height = random(e) + d
        } else b.height = random(c) + d;
    if (!("width" in b))
        if ("j" in b) {
            e = a.n_j - d - b.j;
            if (e < 0) e = 0;
            e = e < c ? e : c;
            b.width = random(e) + d
        } else b.width = random(c) + d;
        "i" in b || (b.i = random(a.n_i - b.height));
    "j" in b || (b.j = random(a.n_j - b.width));
    return b
}

function sound_room(a, b, c, d, e) {
    var g = {};
    for (b = b; b <= d; b++) {
        var f;
        for (f = c; f <= e; f++) {
            if (a.cell[b][f] & BLOCKED) return {
                blocked: 1
            };
            if (a.cell[b][f] & ROOM) {
                var h = (a.cell[b][f] & ROOM_ID) >> 6;
                g[h] += 1
            }
        }
    }
    return g
}
var connect = {};

function open_rooms(a) {
    connect = {};
    var b;
    for (b = 1; b <= a.n_rooms; b++) a = open_room(a, a.room[b]);
    return a
}

function open_room(a, b) {
    var c = door_sills(a, b);
    if (!c.length) return a;
    var d = alloc_opens(a, b),
        e;
    for (e = 0; e < d; e++) {
        var g = c.splice(random(c.length), 1).shift();
        if (!g) break;
        var f = g.door_r,
            h = g.door_c;
        f = a.cell[f][h];
        if (!(f & DOORSPACE))
            if (f = g.out_id) {
                f = [b.id, f].sort(cmp_int).join(",");
                if (!connect[f]) {
                    a = open_door(a, b, g);
                    connect[f] = 1
                }
            } else a = open_door(a, b, g)
    }
    return a
}

function cmp_int(a, b) {
    return a - b
}

function door_sills(a, b) {
    var c = a.cell,
        d, e = [];
    if (b.complex) b.complex.each(function(k) {
        k = door_sills(a, k);
        if (k.length) e = e.concat(k)
    });
    else {
        var g = b.north,
            f = b.south,
            h = b.west,
            i = b.east;
        if (g >= 3) {
            var j;
            for (j = h; j <= i; j += 2)
                if (d = check_sill(c, b, g, j, "north")) e.push(d)
        }
        if (f <= a.n_rows - 3)
            for (j = h; j <= i; j += 2)
                if (d = check_sill(c, b, f, j, "south")) e.push(d);
        if (h >= 3)
            for (j = g; j <= f; j += 2)
                if (d = check_sill(c, b, j, h, "west")) e.push(d);
        if (i <= a.n_cols - 3)
            for (j = g; j <= f; j += 2)
                if (d = check_sill(c, b, j, i, "east")) e.push(d)
    }
    return e
}

function check_sill(a, b, c, d, e) {
    var g = c + di[e],
        f = d + dj[e],
        h = a[g][f];
    if (!(h & PERIMETER)) return false;
    if (h & BLOCK_DOOR) return false;
    h = g + di[e];
    var i = f + dj[e];
    a = a[h][i];
    if (a & BLOCKED) return false;
    a = (a & ROOM_ID) >> 6;
    if (a == b.id) return false;
    return b = {
        sill_r: c,
        sill_c: d,
        dir: e,
        door_r: g,
        door_c: f,
        out_id: a
    }
}

function alloc_opens(a, b) {
    a = (b.south - b.north) / 2 + 1;
    b = (b.east - b.west) / 2 + 1;
    b = Math.floor(Math.sqrt(b * a));
    return b = b + random(b)
}
dc.doors.none.table = {
    "01-15": ARCH
};
dc.doors.basic.table = {
    "01-15": ARCH,
    "16-60": DOOR
};
dc.doors.secure.table = {
    "01-15": ARCH,
    "16-60": DOOR,
    "61-75": LOCKED
};
dc.doors.standard.table = {
    "01-15": ARCH,
    "16-60": DOOR,
    "61-75": LOCKED,
    "76-90": TRAPPED,
    "91-100": SECRET,
    "101-110": PORTC
};
dc.doors.deathtrap.table = {
    "01-15": ARCH,
    "16-30": TRAPPED,
    "31-40": SECRET
};

function open_door(a, b, c) {
    var d = get_dc("doors", a),
        e = d.table;
    d = c.door_r;
    var g = c.door_c,
        f = c.sill_r,
        h = c.sill_c,
        i = c.dir;
    c = c.out_id;
    var j;
    for (j = 0; j < 3; j++) {
        var k = f + di[i] * j,
            l = h + dj[i] * j;
        a.cell[k][l] &= ~PERIMETER;
        a.cell[k][l] |= ENTRANCE
    }
    e = select_from_table(e);
    f = {
        row: d,
        col: g
    };
    if (e == ARCH) {
        a.cell[d][g] |= ARCH;
        f.key = "arch";
        f.type = "Archway"
    } else if (e == DOOR) {
        a.cell[d][g] |= DOOR;
        f.key = "open";
        f.type = "Unlocked Door"
    } else if (e == LOCKED) {
        a.cell[d][g] |= LOCKED;
        f.key = "lock";
        f.type = "Locked Door"
    } else if (e == TRAPPED) {
        a.cell[d][g] |=
            TRAPPED;
        f.key = "trap";
        f.type = "Trapped Door"
    } else if (e == SECRET) {
        a.cell[d][g] |= SECRET;
        f.key = "secret";
        f.type = "Secret Door"
    } else if (e == PORTC) {
        a.cell[d][g] |= PORTC;
        f.key = "portc";
        f.type = "Portcullis"
    }
    if (c) f.out_id = c;
    b.door[i].push(f);
    b.last_door = f;
    return a
}

function label_rooms(a) {
    var b;
    for (b = 1; b <= a.n_rooms; b++) {
        var c = a.room[b],
            d = c.id.toString(),
            e = d.length,
            g = Math.floor((c.north + c.south) / 2);
        c = Math.floor((c.west + c.east - e) / 2) + 1;
        var f;
        for (f = 0; f < e; f++) a.cell[g][c + f] |= d.charCodeAt(f) << 24
    }
    return a
}

function corridors(a) {
    var b = get_dc("corridor_layout", a);
    a.straight_pct = b.pct;
    for (b = 1; b < a.n_i; b++) {
        var c = b * 2 + 1,
            d;
        for (d = 1; d < a.n_j; d++) {
            var e = d * 2 + 1;
            a.cell[c][e] & CORRIDOR || (a = tunnel(a, b, d))
        }
    }
    return a
}

function tunnel(a, b, c, d) {
    d = tunnel_dirs(a, d);
    d.each(function(e) {
        if (open_tunnel(a, b, c, e)) {
            var g = b + di[e],
                f = c + dj[e];
            a = tunnel(a, g, f, e)
        }
    });
    return a
}

function tunnel_dirs(a, b) {
    var c = shuffle(dj_dirs);
    b && a.straight_pct && random(100) < a.straight_pct && c.unshift(b);
    return c
}

function shuffle(a) {
    a = a.concat();
    var b;
    for (b = a.length - 1; b > 0; b--) {
        var c = random(b + 1),
            d = a[b];
        a[b] = a[c];
        a[c] = d
    }
    return a
}

function open_tunnel(a, b, c, d) {
    var e = b * 2 + 1,
        g = c * 2 + 1;
    b = (b + di[d]) * 2 + 1;
    c = (c + dj[d]) * 2 + 1;
    d = (e + b) / 2;
    var f = (g + c) / 2;
    return sound_tunnel(a, d, f, b, c) ? delve_tunnel(a, e, g, b, c) : false
}

function sound_tunnel(a, b, c, d, e) {
    if (d < 0 || d > a.n_rows) return false;
    if (e < 0 || e > a.n_cols) return false;
    b = [b, d].sort(cmp_int);
    c = [c, e].sort(cmp_int);
    for (e = b[0]; e <= b[1]; e++)
        for (d = c[0]; d <= c[1]; d++)
            if (a.cell[e][d] & BLOCK_CORR) return false;
    return true
}

function delve_tunnel(a, b, c, d, e) {
    b = [b, d].sort(cmp_int);
    c = [c, e].sort(cmp_int);
    for (e = b[0]; e <= b[1]; e++)
        for (d = c[0]; d <= c[1]; d++) {
            a.cell[e][d] &= ~ENTRANCE;
            a.cell[e][d] |= CORRIDOR
        }
    return true
}

function emplace_stairs(a) {
    var b = stair_ends(a);
    if (!b.length) return a;
    var c = alloc_stairs(a);
    if (c == 0) return a;
    var d = [],
        e;
    for (e = 0; e < c; e++) {
        var g = b.splice(random(b.length), 1).shift();
        if (!g) break;
        var f = g.row,
            h = g.col,
            i = e < 2 ? e : random(2);
        if (i == 0) {
            a.cell[f][h] |= STAIR_DN;
            g.key = "down"
        } else {
            a.cell[f][h] |= STAIR_UP;
            g.key = "up"
        }
        d.push(g)
    }
    a.stair = d;
    return a
}

function stair_ends(a) {
    var b = a.cell,
        c = [],
        d;
    for (d = 0; d < a.n_i; d++) {
        var e = d * 2 + 1,
            g;
        for (g = 0; g < a.n_j; g++) {
            var f = g * 2 + 1;
            if (a.cell[e][f] == CORRIDOR) a.cell[e][f] & STAIRS || $H(stair_end).keys().each(function(h) {
                if (check_tunnel(b, e, f, stair_end[h])) {
                    var i = {
                        row: e,
                        col: f,
                        dir: h
                    };
                    h = stair_end[h].next;
                    i.next_row = i.row + h[0];
                    i.next_col = i.col + h[1];
                    c.push(i)
                }
            })
        }
    }
    return c
}
var stair_end = {
    north: {
        walled: [
            [1, -1],
            [0, -1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1]
        ],
        corridor: [
            [0, 0],
            [1, 0],
            [2, 0]
        ],
        stair: [0, 0],
        next: [1, 0]
    },
    south: {
        walled: [
            [-1, -1],
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1]
        ],
        corridor: [
            [0, 0],
            [-1, 0],
            [-2, 0]
        ],
        stair: [0, 0],
        next: [-1, 0]
    },
    west: {
        walled: [
            [-1, 1],
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1]
        ],
        corridor: [
            [0, 0],
            [0, 1],
            [0, 2]
        ],
        stair: [0, 0],
        next: [0, 1]
    },
    east: {
        walled: [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1]
        ],
        corridor: [
            [0, 0],
            [0, -1],
            [0, -2]
        ],
        stair: [0, 0],
        next: [0, -1]
    }
};

function check_tunnel(a, b, c, d) {
    var e = true,
        g;
    if (g = d.corridor) {
        g.each(function(f) {
            if (a[b + f[0]])
                if (a[b + f[0]][c + f[1]] != CORRIDOR) e = false
        });
        if (!e) return false
    }
    if (d = d.walled) {
        d.each(function(f) {
            if (a[b + f[0]])
                if (a[b + f[0]][c + f[1]] & OPENSPACE) e = false
        });
        if (!e) return false
    }
    return true
}

function alloc_stairs(a) {
    var b = 0;
    if (a.add_stairs == "many") {
        a = a.n_cols * a.n_rows;
        b = 5 + random(Math.floor(a / 1E3))
    } else if (a.add_stairs == "yes") b = 2;
    return b
}

function peripheral_egress(a) {
    return a
}

function gelatinous_cube(a) {
    if (a.remove_deadends) a = remove_deadends(a);
    if (a.remove_deadends)
        if (a.corridor_layout == "errant") a.close_arcs = a.remove_pct;
        else if (a.corridor_layout == "straight") a.close_arcs = a.remove_pct;
    if (a.close_arcs) a = close_arcs(a);
    a = fix_doors(a);
    return a = empty_blocks(a)
}

function remove_deadends(a) {
    var b = get_dc("remove_deadends", a);
    a.remove_pct = b.pct;
    b = a.remove_pct;
    return collapse_tunnels(a, b, close_end)
}
var close_end = {
    north: {
        walled: [
            [0, -1],
            [1, -1],
            [1, 0],
            [1, 1],
            [0, 1]
        ],
        close: [
            [0, 0]
        ],
        recurse: [-1, 0]
    },
    south: {
        walled: [
            [0, -1],
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, 1]
        ],
        close: [
            [0, 0]
        ],
        recurse: [1, 0]
    },
    west: {
        walled: [
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0]
        ],
        close: [
            [0, 0]
        ],
        recurse: [0, -1]
    },
    east: {
        walled: [
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1],
            [1, 0]
        ],
        close: [
            [0, 0]
        ],
        recurse: [0, 1]
    }
};

function close_arcs(a) {
    var b = a.close_arcs;
    return collapse_tunnels(a, b, close_arcs)
}
var close_arc = {
    "north-west": {
        corridor: [
            [0, 0],
            [-1, 0],
            [-2, 0],
            [-2, -1],
            [-2, -2],
            [-1, -2],
            [0, -2]
        ],
        walled: [
            [-1, 1],
            [-2, 1],
            [-3, 1],
            [-3, 0],
            [-3, -1],
            [-3, -2],
            [-3, -3],
            [-2, -3],
            [-1, -3],
            [0, -1],
            [-1, -1]
        ],
        close: [
            [-1, 0],
            [-2, 0],
            [-2, -1],
            [-2, -2],
            [-1, -2]
        ],
        open: [0, -1],
        recurse: [2, 0]
    },
    "north-east": {
        corridor: [
            [0, 0],
            [-1, 0],
            [-2, 0],
            [-2, 1],
            [-2, 2],
            [-1, 2],
            [0, 2]
        ],
        walled: [
            [-1, -1],
            [-2, -1],
            [-3, -1],
            [-3, 0],
            [-3, 1],
            [-3, 2],
            [-3, 3],
            [-2, 3],
            [-1, 3],
            [0, 1],
            [-1, 1]
        ],
        close: [
            [-1, 0],
            [-2, 0],
            [-2, 1],
            [-2, 2],
            [-1, 2]
        ],
        open: [0, 1],
        recurse: [2, 0]
    },
    "south-west": {
        corridor: [
            [0,
                0
            ],
            [1, 0],
            [2, 0],
            [2, -1],
            [2, -2],
            [1, -2],
            [0, -2]
        ],
        walled: [
            [1, 1],
            [2, 1],
            [3, 1],
            [3, 0],
            [3, -1],
            [3, -2],
            [3, -3],
            [2, -3],
            [1, -3],
            [0, -1],
            [1, -1]
        ],
        close: [
            [1, 0],
            [2, 0],
            [2, -1],
            [2, -2],
            [1, -2]
        ],
        open: [0, -1],
        recurse: [-2, 0]
    },
    "south-east": {
        corridor: [
            [0, 0],
            [1, 0],
            [2, 0],
            [2, 1],
            [2, 2],
            [1, 2],
            [0, 2]
        ],
        walled: [
            [1, -1],
            [2, -1],
            [3, -1],
            [3, 0],
            [3, 1],
            [3, 2],
            [3, 3],
            [2, 3],
            [1, 3],
            [0, 1],
            [1, 1]
        ],
        close: [
            [1, 0],
            [2, 0],
            [2, 1],
            [2, 2],
            [1, 2]
        ],
        open: [0, 1],
        recurse: [-2, 0]
    },
    "west-north": {
        corridor: [
            [0, 0],
            [0, -1],
            [0, -2],
            [-1, -2],
            [-2, -2],
            [-2, -1],
            [-2, 0]
        ],
        walled: [
            [1, -1],
            [1, -2],
            [1, -3],
            [0, -3],
            [-1, -3],
            [-2, -3],
            [-3, -3],
            [-3, -2],
            [-3, -1],
            [-1, 0],
            [-1, -1]
        ],
        close: [
            [0, -1],
            [0, -2],
            [-1, -2],
            [-2, -2],
            [-2, -1]
        ],
        open: [-1, 0],
        recurse: [0, 2]
    },
    "west-south": {
        corridor: [
            [0, 0],
            [0, -1],
            [0, -2],
            [1, -2],
            [2, -2],
            [2, -1],
            [2, 0]
        ],
        walled: [
            [-1, -1],
            [-1, -2],
            [-1, -3],
            [0, -3],
            [1, -3],
            [2, -3],
            [3, -3],
            [3, -2],
            [3, -1],
            [1, 0],
            [1, -1]
        ],
        close: [
            [0, -1],
            [0, -2],
            [1, -2],
            [2, -2],
            [2, -1]
        ],
        open: [1, 0],
        recurse: [0, 2]
    },
    "east-north": {
        corridor: [
            [0, 0],
            [0, 1],
            [0, 2],
            [-1, 2],
            [-2, 2],
            [-2, 1],
            [-2, 0]
        ],
        walled: [
            [1, 1],
            [1, 2],
            [1, 3],
            [0, 3],
            [-1, 3],
            [-2, 3],
            [-3, 3],
            [-3, 2],
            [-3, 1],
            [-1, 0],
            [-1, 1]
        ],
        close: [
            [0, 1],
            [0, 2],
            [-1, 2],
            [-2, 2],
            [-2, 1]
        ],
        open: [-1, 0],
        recurse: [0, -2]
    },
    "east-south": {
        corridor: [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 2],
            [2, 2],
            [2, 1],
            [2, 0]
        ],
        walled: [
            [-1, 1],
            [-1, 2],
            [-1, 3],
            [0, 3],
            [1, 3],
            [2, 3],
            [3, 3],
            [3, 2],
            [3, 1],
            [1, 0],
            [1, 1]
        ],
        close: [
            [0, 1],
            [0, 2],
            [1, 2],
            [2, 2],
            [2, 1]
        ],
        open: [1, 0],
        recurse: [0, -2]
    }
};

function collapse_tunnels(a, b, c) {
    var d = b == 100,
        e;
    for (e = 0; e < a.n_i; e++) {
        var g = e * 2 + 1,
            f;
        for (f = 0; f < a.n_j; f++) {
            var h = f * 2 + 1;
            if (a.cell[g][h] & OPENSPACE)
                if (!(a.cell[g][h] & STAIRS))
                    if (d || random(100) < b) a = collapse(a, g, h, c)
        }
    }
    return a
}

function collapse(a, b, c, d) {
    var e = a.cell;
    if (!(a.cell[b][c] & OPENSPACE)) return a;
    $H(d).keys().each(function(g) {
        if (check_tunnel(e, b, c, d[g])) {
            var f;
            if (f = d[g].close) f.each(function(h) {
                e[b + h[0]][c + h[1]] = NOTHING
            });
            if (f = d[g].open) e[b + f[0]][c + f[1]] |= CORRIDOR;
            if (g = d[g].recurse) a = collapse(a, b + g[0], c + g[1], d)
        }
    });
    a.cell = e;
    return a
}

function fix_doors(a) {
    var b = {},
        c = [];
    a.room.each(function(d) {
        var e = d.id;
        $H(d.door).keys().each(function(g) {
            var f = [];
            d.door[g].each(function(h) {
                var i = h.row,
                    j = h.col,
                    k = a.cell[i][j];
                if (k & OPENSPACE) {
                    i = [i, j].join(",");
                    if (b[i]) f.push(h);
                    else {
                        if (j = h.out_id) {
                            k = a.room[j];
                            var l = opposite[g];
                            h.out_id = {};
                            h.out_id[e] = j;
                            h.out_id[j] = e;
                            k.door[l].push(h)
                        }
                        f.push(h);
                        b[i] = true
                    }
                }
            });
            if (f.length) {
                d.door[g] = f;
                c = c.concat(f)
            } else d.door[g] = []
        })
    });
    a.door = c;
    return a
}

function empty_blocks(a) {
    var b = a.cell,
        c;
    for (c = 0; c <= a.n_rows; c++) {
        var d;
        for (d = 0; d <= a.n_cols; d++)
            if (b[c][d] & BLOCKED) b[c][d] = NOTHING
    }
    a.cell = b;
    return a
}
var palette = {
        standard: {
            colors: {
                fill: "#000000",
                open: "#ffffff",
                open_grid: "#cccccc"
            }
        },
        classic: {
            colors: {
                fill: "#3399cc",
                open: "#ffffff",
                open_grid: "#3399cc",
                hover: "#b6def2"
            }
        },
        graph: {
            colors: {
                fill: "#ffffff",
                open: "#ffffff",
                grid: "#c9ebf5",
                wall: "#666666",
                wall_shading: "#666666",
                door: "#333333",
                label: "#333333",
                tag: "#666666"
            }
        }
    },
    color_chain = {
        door: "fill",
        label: "fill",
        stair: "wall",
        wall: "fill",
        fill: "black",
        tag: "white"
    };

function image_dungeon(a) {
    var b = scale_dungeon(a),
        c = new_image(b.width, b.height),
        d = get_palette(b);
    b.palette = d;
    d = base_layer(a, b, c);
    b.base_layer = d;
    fill_image(a, b, c);
    open_cells(a, b, c);
    image_walls(a, b, c);
    a.door && image_doors(a, b, c);
    image_labels(a, b, c);
    a.stair && image_stairs(a, b, c)
}

function new_image(a, b) {
    var c = $("map");
    c.width = a;
    c.height = b;
    return c.getContext("2d")
}

function scale_dungeon(a) {
    var b = {
        map_style: a.map_style,
        grid: a.grid
    };
    b.cell_size = a.cell_size;
    b.width = (a.n_cols + 1) * b.cell_size + 1;
    b.height = (a.n_rows + 1) * b.cell_size + 1;
    b.max_x = b.width - 1;
    b.max_y = b.height - 1;
    a = Math.floor(b.cell_size * 0.75);
    b.font = a.toString() + "px sans-serif";
    return b
}

function get_palette(a) {
    var b;
    b = a.palette ? a.palette : (style = a.map_style) ? palette[style] ? palette[style] : palette.standard : palette.standard;
    var c;
    if (c = b.colors) $H(c).keys().each(function(d) {
        b[d] = c[d]
    });
    b.black || (b.black = "#000000");
    b.white || (b.white = "#ffffff");
    return b
}

function get_color(a, b) {
    for (; b;) {
        if (a[b]) return a[b];
        b = color_chain[b]
    }
    return "#000000"
}

function base_layer(a, b) {
    var c = new Element("canvas");
    c.width = b.width;
    c.height = b.height;
    var d = c.getContext("2d"),
        e = b.max_x,
        g = b.max_y,
        f = b.palette,
        h;
    (h = f.open) ? fill_rect(d, 0, 0, e, g, h): fill_rect(d, 0, 0, e, g, f.white);
    if (h = f.open_grid) image_grid(a, b, h, d);
    else if (h = f.grid) image_grid(a, b, h, d);
    return c
}

function image_grid(a, b, c, d) {
    if (a.grid != "none")
        if (a.grid == "hex") hex_grid(a, b, c, d);
        else a.grid == "vex" ? vex_grid(a, b, c, d) : square_grid(a, b, c, d);
    return true
}

function square_grid(a, b, c, d) {
    a = b.cell_size;
    var e;
    for (e = 0; e <= b.max_x; e += a) draw_line(d, e, 0, e, b.max_y, c);
    for (e = 0; e <= b.max_y; e += a) draw_line(d, 0, e, b.max_x, e, c);
    return true
}

function hex_grid(a, b, c, d) {
    var e = b.cell_size;
    a = e / 3.4641016151;
    e = e / 2;
    var g = b.width / (3 * a);
    b = b.height / e;
    var f;
    for (f = 0; f < g; f++) {
        var h = f * 3 * a,
            i = h + a,
            j = h + 3 * a,
            k;
        for (k = 0; k < b; k++) {
            var l = k * e,
                o = l + e;
            if ((f + k) % 2 != 0) {
                draw_line(d, h, l, i, o, c);
                draw_line(d, i, o, j, o, c)
            } else draw_line(d, i, l, h, o, c)
        }
    }
    return true
}

function vex_grid(a, b, c, d) {
    var e = b.cell_size;
    a = e / 2;
    e = e / 3.4641016151;
    var g = b.width / a;
    b = b.height / (3 * e);
    var f;
    for (f = 0; f < b; f++) {
        var h = f * 3 * e,
            i = h + e,
            j = h + 3 * e,
            k;
        for (k = 0; k < g; k++) {
            var l = k * a,
                o = l + a;
            if ((f + k) % 2 != 0) {
                draw_line(d, l, h, o, i, c);
                draw_line(d, o, i, o, j, c)
            } else draw_line(d, l, i, o, h, c)
        }
    }
    return true
}

function fill_image(a, b, c) {
    var d = b.max_x,
        e = b.max_y,
        g = b.palette,
        f;
    (f = g.fill) ? fill_rect(c, 0, 0, d, e, f): fill_rect(c, 0, 0, d, e, g.black);
    if (f = g.fill) fill_rect(c, 0, 0, d, e, f);
    if (f = g.fill_grid) image_grid(a, b, f, c);
    else if (f = g.grid) image_grid(a, b, f, c);
    return true
}

function open_cells(a, b, c) {
    var d = b.cell_size;
    b = b.base_layer;
    var e;
    for (e = 0; e <= a.n_rows; e++) {
        var g = e * d,
            f;
        for (f = 0; f <= a.n_cols; f++)
            if (a.cell[e][f] & OPENSPACE) {
                var h = f * d;
                c.drawImage(b, h, g, d, d, h, g, d, d)
            }
    }
    return true
}

function image_walls(a, b, c) {
    var d = b.cell_size,
        e = Math.floor(d / 4);
    if (e < 3) e = 3;
    b = b.palette;
    var g;
    cache_pixels(true);
    var f;
    for (f = 0; f <= a.n_rows; f++) {
        var h = f * d,
            i = h + d,
            j;
        for (j = 0; j <= a.n_cols; j++)
            if (a.cell[f][j] & OPENSPACE) {
                var k = j * d,
                    l = k + d;
                if (g = b.bevel_nw) {
                    a.cell[f][j - 1] & OPENSPACE || draw_line(c, k - 1, h, k - 1, i, g);
                    a.cell[f - 1][j] & OPENSPACE || draw_line(c, k, h - 1, l, h - 1, g);
                    if (g = b.bevel_se) {
                        a.cell[f][j + 1] & OPENSPACE || draw_line(c, l + 1, h + 1, l + 1, i, g);
                        a.cell[f + 1][j] & OPENSPACE || draw_line(c, k + 1, i + 1, l, i + 1, g)
                    }
                } else if (g = b.wall_shading) {
                    a.cell[f -
                        1][j - 1] & OPENSPACE || wall_shading(c, k - e, h - e, k - 1, h - 1, g);
                    a.cell[f - 1][j] & OPENSPACE || wall_shading(c, k, h - e, l, h - 1, g);
                    a.cell[f - 1][j + 1] & OPENSPACE || wall_shading(c, l + 1, h - e, l + e, h - 1, g);
                    a.cell[f][j - 1] & OPENSPACE || wall_shading(c, k - e, h, k - 1, i, g);
                    a.cell[f][j + 1] & OPENSPACE || wall_shading(c, l + 1, h, l + e, i, g);
                    a.cell[f + 1][j - 1] & OPENSPACE || wall_shading(c, k - e, i + 1, k - 1, i + e, g);
                    a.cell[f + 1][j] & OPENSPACE || wall_shading(c, k, i + 1, l, i + e, g);
                    a.cell[f + 1][j + 1] & OPENSPACE || wall_shading(c, l + 1, i + 1, l + e, i + e, g)
                }
                if (g = b.wall) {
                    a.cell[f - 1][j] & OPENSPACE ||
                        draw_line(c, k, h, l, h, g);
                    a.cell[f][j - 1] & OPENSPACE || draw_line(c, k, h, k, i, g);
                    a.cell[f][j + 1] & OPENSPACE || draw_line(c, l, h, l, i, g);
                    a.cell[f + 1][j] & OPENSPACE || draw_line(c, k, i, l, i, g)
                }
            }
    }
    dump_pixels(c);
    return true
}

function wall_shading(a, b, c, d, e, g) {
    for (b = b; b <= d; b++) {
        var f;
        for (f = c; f <= e; f++)(b + f) % 2 != 0 && set_pixel(a, b, f, g)
    }
    return true
}

function image_doors(a, b, c) {
    var d = a.door,
        e = b.cell_size,
        g = Math.floor(e / 6),
        f = Math.floor(e / 4),
        h = Math.floor(e / 3);
    b = b.palette;
    var i = get_color(b, "wall"),
        j = get_color(b, "door");
    d.each(function(k) {
        var l = k.row,
            o = l * e,
            p = k.col,
            q = p * e;
        k = door_attr(k);
        var r = a.cell[l][p - 1] & OPENSPACE;
        l = o + e;
        p = q + e;
        var m = Math.floor((o + l) / 2),
            n = Math.floor((q + p) / 2);
        if (k.wall) r ? draw_line(c, n, o, n, l, i) : draw_line(c, q, m, p, m, i);
        if (k.arch)
            if (r) {
                fill_rect(c, n - 1, o, n + 1, o + g, i);
                fill_rect(c, n - 1, l - g, n + 1, l, i)
            } else {
                fill_rect(c, q, m - 1, q + g, m + 1, i);
                fill_rect(c,
                    p - g, m - 1, p, m + 1, i)
            }
        if (k.door) r ? stroke_rect(c, n - f, o + g + 1, n + f, l - g - 1, j) : stroke_rect(c, q + g + 1, m - f, p - g - 1, m + f, j);
        if (k.lock) r ? draw_line(c, n, o + g + 1, n, l - g - 1, j) : draw_line(c, q + g + 1, m, p - g - 1, m, j);
        if (k.trap) r ? draw_line(c, n - h, m, n + h, m, j) : draw_line(c, n, m - h, n, m + h, j);
        if (k.secret)
            if (r) {
                draw_line(c, n - 1, m - f, n + 2, m - f, j);
                draw_line(c, n - 2, m - f + 1, n - 2, m - 1, j);
                draw_line(c, n - 1, m, n + 1, m, j);
                draw_line(c, n + 2, m + 1, n + 2, m + f - 1, j);
                draw_line(c, n - 2, m + f, n + 1, m + f, j)
            } else {
                draw_line(c, n - f, m - 2, n - f, m + 1, j);
                draw_line(c, n - f + 1, m + 2, n - 1, m + 2, j);
                draw_line(c, n, m -
                    1, n, m + 1, j);
                draw_line(c, n + 1, m - 2, n + f - 1, m - 2, j);
                draw_line(c, n + f, m - 1, n + f, m + 2, j)
            }
        if (k.portc)
            if (r)
                for (o = o + g + 2; o < l - g; o += 2) set_pixel(c, n, o, j);
            else
                for (o = q + g + 2; o < p - g; o += 2) set_pixel(c, o, m, j)
    });
    return true
}

function door_attr(a) {
    var b;
    if (a.key == "arch") b = {
        arch: 1
    };
    else if (a.key == "open") b = {
        arch: 1,
        door: 1
    };
    else if (a.key == "lock") b = {
        arch: 1,
        door: 1,
        lock: 1
    };
    else if (a.key == "trap") {
        b = {
            arch: 1,
            door: 1,
            trap: 1
        };
        if (/Lock/.test(a.desc)) b.lock = 1
    } else if (a.key == "secret") b = {
        wall: 1,
        arch: 1,
        secret: 1
    };
    else if (a.key == "portc") b = {
        arch: 1,
        portc: 1
    };
    return b
}

function image_labels(a, b, c) {
    var d = b.cell_size,
        e = Math.floor(d / 2),
        g = b.palette;
    b = b.font;
    g = get_color(g, "label");
    var f;
    for (f = 0; f <= a.n_rows; f++) {
        var h;
        for (h = 0; h <= a.n_cols; h++)
            if (a.cell[f][h] & OPENSPACE) {
                var i = cell_label(a.cell[f][h]);
                if (i) {
                    var j = f * d + e + 1,
                        k = h * d + e;
                    draw_string(c, i, k, j, b, g)
                }
            }
    }
    return true
}

function cell_label(a) {
    a = a >> 24 & 255;
    if (a == 0) return false;
    a = String.fromCharCode(a);
    if (!/^\w/.test(a)) return false;
    if (/[hjkl]/.test(a)) return false;
    return a
}

function image_stairs(a, b, c) {
    a = a.stair;
    var d = scale_stairs(b.cell_size);
    b = b.palette;
    var e = get_color(b, "stair");
    a.each(function(g) {
        var f = stair_dim(g, d);
        g.key == "up" ? image_ascend(f, e, c) : image_descend(f, e, c)
    });
    return true
}

function scale_stairs(a) {
    a = {
        cell: a,
        len: a * 2,
        side: Math.floor(a / 2),
        tread: Math.floor(a / 20) + 2,
        down: {}
    };
    var b;
    for (b = 0; b < a.len; b += a.tread) a.down[b] = Math.floor(b / a.len * a.side);
    return a
}

function stair_dim(a, b) {
    if (a.next_row != a.row) {
        var c = Math.floor((a.col + 0.5) * b.cell);
        a = tread_list(a.row, a.next_row, b);
        var d = a.shift();
        a = {
            xc: c,
            y1: d,
            list: a
        }
    } else {
        c = Math.floor((a.row + 0.5) * b.cell);
        a = tread_list(a.col, a.next_col, b);
        d = a.shift();
        a = {
            yc: c,
            x1: d,
            list: a
        }
    }
    a.side = b.side;
    a.down = b.down;
    return a
}

function tread_list(a, b, c) {
    var d = [];
    if (b > a) {
        a = a * c.cell;
        d.push(a);
        b = (b + 1) * c.cell;
        for (a = a; a < b; a += c.tread) d.push(a)
    } else if (b < a) {
        a = (a + 1) * c.cell;
        d.push(a);
        b = b * c.cell;
        for (a = a; a > b; a -= c.tread) d.push(a)
    }
    return d
}

function image_ascend(a, b, c) {
    if (a.xc) {
        var d = a.xc - a.side,
            e = a.xc + a.side;
        a.list.each(function(h) {
            draw_line(c, d, h, e, h, b)
        })
    } else {
        var g = a.yc - a.side,
            f = a.yc + a.side;
        a.list.each(function(h) {
            draw_line(c, h, g, h, f, b)
        })
    }
    return true
}

function image_descend(a, b, c) {
    if (a.xc) {
        var d = a.xc;
        a.list.each(function(g) {
            var f = a.down[Math.abs(g - a.y1)];
            draw_line(c, d - f, g, d + f, g, b)
        })
    } else {
        var e = a.yc;
        a.list.each(function(g) {
            var f = a.down[Math.abs(g - a.x1)];
            draw_line(c, g, e - f, g, e + f, b)
        })
    }
    return true
}

function save_map() {
    save_canvas($("map"), $("dungeon_name").getValue() + ".png")
}
document.observe("dom:loaded", init_form);