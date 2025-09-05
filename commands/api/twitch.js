const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'twitch',
    description: 'Get Twitch streamer information',
    usage: 'twitch <username>',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a Twitch username! Example: `twitch ninja`');
        }

        const username = args[0].toLowerCase();
        
        try {
            // Using Twitch's public API endpoint
            const response = await fetch(`https://www.twitch.tv/${username}`);
            const html = await response.text();
            
            // Check if user exists
            if (html.includes('Sorry. Unless you\'ve got a time machine')) {
                return message.reply('Twitch user not found!');
            }

            // Extract basic info from HTML
            const titleMatch = html.match(/<title>([^<]+)<\/title>/);
            const descMatch = html.match(/"description":"([^"]+)"/);
            const followersMatch = html.match(/"followers":{"totalCount":(\d+)}/);
            const gameMatch = html.match(/"game":{"name":"([^"]+)"/);
            const isLiveMatch = html.match(/"isLiveBroadcasting":true/);
            
            const displayName = titleMatch ? titleMatch[1].split(' - ')[0] : username;
            const description = descMatch ? descMatch[1] : 'No description available';
            const followers = followersMatch ? parseInt(followersMatch[1]).toLocaleString() : 'N/A';
            const currentGame = gameMatch ? gameMatch[1] : 'Not playing';
            const isLive = !!isLiveMatch;
            
            const embed = new EmbedBuilder()
                .setTitle(`🎮 ${displayName}`)
                .setURL(`https://www.twitch.tv/${username}`)
                .setDescription(description)
                .addFields(
                    { name: '👥 Followers', value: followers, inline: true },
                    { name: '🎯 Current Game', value: currentGame, inline: true },
                    { name: '📺 Status', value: isLive ? '🔴 LIVE' : '⚫ Offline', inline: true }
                )
                .setColor(isLive ? '#9146FF' : '#6441A4')
                .setThumbnail(`https://logo.clearbit.com/twitch.tv`)
                .setFooter({ text: 'Twitch Channel Info' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Twitch API error:', error);
            message.reply('Failed to fetch Twitch information!');
        }
    }
};
