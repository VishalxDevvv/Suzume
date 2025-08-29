const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'number',
    description: 'Get interesting facts about numbers',
    async execute(message, args) {
        try {
            let number = args[0] || Math.floor(Math.random() * 1000);
            const type = args[1] || 'trivia'; // trivia, math, date, year
            
            const response = await fetch(`http://numbersapi.com/${number}/${type}`);
            const fact = await response.text();
            
            const embed = new EmbedBuilder()
                .setTitle(`🔢 Number Fact: ${number}`)
                .setDescription(fact)
                .setColor('#f59e0b')
                .addFields({ name: '${ROYAL_EMOJIS.STATS} Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true })
                .setFooter({ text: 'Numbers API' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Numbers API error:', error);
            message.reply('Failed to fetch number fact!');
        }
    }
};
