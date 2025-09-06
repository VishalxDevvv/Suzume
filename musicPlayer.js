const { Player } = require('discord-player');

class MusicPlayer {
    constructor(client) {
        this.player = new Player(client, {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }
        });

        this.player.extractors.loadDefault();
    }

    getPlayer() {
        return this.player;
    }
}

module.exports = MusicPlayer;
