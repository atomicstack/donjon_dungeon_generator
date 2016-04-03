var paranoia_clearance_level_config = {
    infrared: {
        weight: 120
    },
    red: {
        weight: 40
    },
    orange: {
        weight: 2
    },
    yellow: {
        weight: 2
    },
    green: {
        weight: 2
    },
    blue: {
        weight: 2
    },
    indigo: {
        weight: 2
    },
    violet: {
        weight: 1
    },
    ultraviolet: {
        weight: 1
    }
};

function get_random_clearance_level() {
    var levels = $A([]);
    $H(paranoia_clearance_level_config).each(function(pair) {
        var clearance_level = pair.key,
            level_config = pair.value;
        for (var i = 1; i <= level_config.weight; i++) {
            levels.push(clearance_level);
        }
    });

    var random_clearance_level_id = Math.floor(Math.random() * levels.length);
    // console.log({ random_clearance_level_id: random_clearance_level_id });
    var random_clearance_level = levels[random_clearance_level_id];
    return random_clearance_level;
}

function get_random_clearance_levels() {
    var levels = $([]);
    for (var i = 1; i <= 30; i++) {
        levels.push(get_random_clearance_level());
    }
    return levels;
}
