const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');

class MusicManager {
    constructor() {
        this.queues = new Map();
    }

    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                songs: [],
                connection: null,
                player: null,
                isPlaying: false,
                volume: 0.5
            });
        }
        return this.queues.get(guildId);
    }

    async play(interaction, query) {
        const queue = this.getQueue(interaction.guild.id);
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('You need to be in a voice channel!');
        }

        try {
            let song;
            
            if (play.yt_validate(query) === 'video') {
                const info = await play.video_info(query);
                song = {
                    title: info.video_details.title,
                    url: query,
                    duration: info.video_details.durationInSec,
                    thumbnail: info.video_details.thumbnails[0]?.url,
                    requestedBy: interaction.user
                };
            } else {
                const results = await play.search(query, { limit: 1 });
                if (!results.length) {
                    return interaction.reply('No results found!');
                }
                const video = results[0];
                song = {
                    title: video.title,
                    url: video.url,
                    duration: video.durationInSec,
                    thumbnail: video.thumbnails[0]?.url,
                    requestedBy: interaction.user
                };
            }

            queue.songs.push(song);

            if (!queue.connection) {
                queue.connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                queue.player = createAudioPlayer();
                queue.connection.subscribe(queue.player);
            }

            if (!queue.isPlaying) {
                this.playNext(interaction.guild.id);
                return interaction.reply(`🎵 Now playing: **${song.title}**`);
            } else {
                return interaction.reply(`➕ Added to queue: **${song.title}**`);
            }
        } catch (error) {
            console.error('Music play error:', error);
            return interaction.reply('Error playing music!');
        }
    }

    async playNext(guildId) {
        const queue = this.getQueue(guildId);
        
        if (!queue.songs.length) {
            queue.isPlaying = false;
            return;
        }

        const song = queue.songs.shift();
        queue.isPlaying = true;

        try {
            const stream = await play.stream(song.url);
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });
            
            queue.player.play(resource);
            
            queue.player.once(AudioPlayerStatus.Idle, () => {
                this.playNext(guildId);
            });
        } catch (error) {
            console.error('Playback error:', error);
            this.playNext(guildId);
        }
    }

    skip(guildId) {
        const queue = this.getQueue(guildId);
        if (queue.player) {
            queue.player.stop();
            return true;
        }
        return false;
    }

    stop(guildId) {
        const queue = this.getQueue(guildId);
        queue.songs = [];
        if (queue.player) queue.player.stop();
        if (queue.connection) queue.connection.destroy();
        this.queues.delete(guildId);
    }

    getQueueInfo(guildId) {
        const queue = this.getQueue(guildId);
        return {
            current: queue.songs[0] || null,
            upcoming: queue.songs.slice(1, 6),
            total: queue.songs.length
        };
    }
}

module.exports = new MusicManager();
