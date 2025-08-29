const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nasa',
    description: 'Get NASA\'s Astronomy Picture of the Day',
    async execute(message, args) {
        try {
            const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.ROCKET} ${data.title}`)
                .setDescription(data.explanation.substring(0, 500) + '...')
                .setImage(data.media_type === 'image' ? data.url : data.thumbnail_url)
                .setColor('#1e3a8a')
                .addFields(
                    { name: '📅 Date', value: data.date, inline: true },
                    { name: '📸 Copyright', value: data.copyright || 'NASA', inline: true }
                )
                .setFooter({ text: 'NASA Astronomy Picture of the Day' })
                .setTimestamp();

            if (data.media_type === 'video') {
                embed.addFields({ name: '🎥 Video', value: `[Watch Here](${data.url})`, inline: false });
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('NASA API error:', error);
            message.reply('Failed to fetch NASA picture!');
        }
    }
};
