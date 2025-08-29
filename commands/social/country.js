const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'country',
    description: 'Get information about a country',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a country name! Usage: `$country <name>`');
        }

        try {
            const country = args.join(' ');
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
            
            if (!response.ok) {
                return message.reply('Country not found!');
            }

            const data = await response.json();
            const info = data[0];

            const embed = new EmbedBuilder()
                .setTitle(`🌍 ${info.name.common}`)
                .setThumbnail(info.flags.png)
                .setColor('#3b82f6')
                .addFields(
                    { name: '🏛️ Capital', value: info.capital ? info.capital[0] : 'N/A', inline: true },
                    { name: '👥 Population', value: info.population.toLocaleString(), inline: true },
                    { name: '🗺️ Region', value: info.region, inline: true },
                    { name: '💰 Currency', value: info.currencies ? Object.values(info.currencies)[0].name : 'N/A', inline: true },
                    { name: '🗣️ Languages', value: info.languages ? Object.values(info.languages).join(', ') : 'N/A', inline: true },
                    { name: '📍 Area', value: `${info.area.toLocaleString()} km²`, inline: true }
                )
                .setFooter({ text: 'REST Countries API' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Country API error:', error);
            message.reply('Failed to fetch country information!');
        }
    }
};
