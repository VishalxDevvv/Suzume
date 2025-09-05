const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'minecraft',
    description: 'Get Minecraft player or server information',
    usage: 'minecraft <player/server> <name/ip>',
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply('Usage: `minecraft player <username>` or `minecraft server <ip>`');
        }

        const type = args[0].toLowerCase();
        const target = args[1];

        try {
            if (type === 'player') {
                // Get player info
                const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${target}`);
                
                if (!response.ok) {
                    return message.reply('Minecraft player not found!');
                }

                const playerData = await response.json();
                
                // Get player skin
                const skinResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${playerData.id}`);
                const skinData = await skinResponse.json();
                
                const embed = new EmbedBuilder()
                    .setTitle(`⛏️ ${playerData.name}`)
                    .addFields(
                        { name: '🆔 UUID', value: playerData.id, inline: false },
                        { name: '👤 Username', value: playerData.name, inline: true }
                    )
                    .setColor('#00AA00')
                    .setThumbnail(`https://crafatar.com/avatars/${playerData.id}?size=128`)
                    .setImage(`https://crafatar.com/renders/body/${playerData.id}?size=256`)
                    .setFooter({ text: 'Minecraft Player Info' })
                    .setTimestamp();

                message.reply({ embeds: [embed] });

            } else if (type === 'server') {
                // Get server info
                const response = await fetch(`https://api.mcsrvstat.us/2/${target}`);
                const serverData = await response.json();
                
                if (!serverData.online) {
                    return message.reply('Minecraft server is offline or not found!');
                }

                const embed = new EmbedBuilder()
                    .setTitle(`🏰 ${target}`)
                    .setDescription(serverData.motd ? serverData.motd.clean.join('\n') : 'No description')
                    .addFields(
                        { name: '👥 Players', value: `${serverData.players.online}/${serverData.players.max}`, inline: true },
                        { name: '📊 Version', value: serverData.version || 'Unknown', inline: true },
                        { name: '🌐 IP', value: target, inline: true }
                    )
                    .setColor('#00AA00')
                    .setFooter({ text: 'Minecraft Server Info' })
                    .setTimestamp();

                if (serverData.icon) {
                    embed.setThumbnail(`data:image/png;base64,${serverData.icon}`);
                }

                message.reply({ embeds: [embed] });
            } else {
                message.reply('Invalid type! Use `player` or `server`.');
            }
        } catch (error) {
            console.error('Minecraft API error:', error);
            message.reply('Failed to fetch Minecraft information!');
        }
    }
};
