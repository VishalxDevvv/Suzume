const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'iplookup',
    description: 'Lookup IP address information',
    async execute(message, args) {
        const ip = args[0];
        
        if (!ip) {
            return message.reply('⚠️ Usage: `+iplookup <ip_address>`');
        }

        try {
            const response = await fetch(`http://ip-api.com/json/${ip}`);
            const data = await response.json();
            
            if (data.status === 'fail') {
                return message.reply('❌ Invalid IP address or lookup failed');
            }

            const embed = new EmbedBuilder()
                .setTitle('🔍 IP Intelligence Report')
                .setDescription(`**Target:** \`${ip}\``)
                .addFields(
                    { name: '🌍 Location', value: `${data.city}, ${data.regionName}, ${data.country}`, inline: true },
                    { name: '🏢 ISP', value: data.isp || 'Unknown', inline: true },
                    { name: '🏛️ Organization', value: data.org || 'Unknown', inline: true },
                    { name: '📍 Coordinates', value: `${data.lat}, ${data.lon}`, inline: true },
                    { name: '⏰ Timezone', value: data.timezone || 'Unknown', inline: true },
                    { name: '📮 ZIP Code', value: data.zip || 'Unknown', inline: true }
                )
                .setColor('#00FF00')
                .setFooter({ text: '🔒 For educational purposes only' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to lookup IP address');
        }
    }
};
