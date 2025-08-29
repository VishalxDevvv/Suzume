const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ip',
    description: 'Get information about an IP address',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide an IP address! Usage: `$ip <ip>`');
        }

        try {
            const ip = args[0];
            const response = await fetch(`http://ip-api.com/json/${ip}`);
            const data = await response.json();

            if (data.status === 'fail') {
                return message.reply('Invalid IP address or lookup failed!');
            }

            const embed = new EmbedBuilder()
                .setTitle(`🌐 IP Information: ${ip}`)
                .setColor('#3b82f6')
                .addFields(
                    { name: '🏙️ City', value: data.city || 'Unknown', inline: true },
                    { name: '🗺️ Region', value: data.regionName || 'Unknown', inline: true },
                    { name: '🏳️ Country', value: data.country || 'Unknown', inline: true },
                    { name: '🌍 Continent', value: data.continent || 'Unknown', inline: true },
                    { name: '📮 Postal Code', value: data.zip || 'Unknown', inline: true },
                    { name: '🏢 ISP', value: data.isp || 'Unknown', inline: true },
                    { name: '📍 Coordinates', value: `${data.lat}, ${data.lon}` || 'Unknown', inline: false }
                )
                .setFooter({ text: 'IP-API Service' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('IP API error:', error);
            message.reply('Failed to lookup IP address!');
        }
    }
};
