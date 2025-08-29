const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'joke',
    description: 'Get a random joke',
    async execute(message, args) {
        try {
            const response = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('ROYAL_EMOJIS.LAUGH Random Joke')
                .setColor('#FFD700');
            
            if (data.type === 'single') {
                embed.setDescription(data.joke);
            } else {
                embed.addFields(
                    { name: '📝 Setup', value: data.setup },
                    { name: '🎯 Punchline', value: data.delivery }
                );
            }
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Joke API error:', error);
            message.reply('Failed to fetch a joke!');
        }
    }
};
