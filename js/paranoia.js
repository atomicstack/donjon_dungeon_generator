function new_dungeon_paranoia() {
    var a = create_dungeon();
    image_dungeon(a);
    console.log('dungeon generation complete');
};

if (typeof new_dungeon === 'function') {
    new_dungeon = new_dungeon_paranoia;
    // console.log('new_dungeon now points to new_dungeon_paranoia');
}
else { console.warn('new_dungeon does not exist? weird'); }
