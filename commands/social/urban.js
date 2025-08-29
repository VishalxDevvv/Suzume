const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'urban',
    description: 'Look up a term in Urban Dictionary',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a term to look up! Usage: `+urban <term>`');
        }

        const term = args.join(' ');
        
        try {
            const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
            const data = await response.json();
            
            if (!data.list.length) {
                return message.reply('No definition found for that term!');
            }
            
            const definition = data.list[0];
            let desc = definition.definition.replace(/\[|\]/g, '');
            if (desc.length > 1000) desc = desc.substring(0, 1000) + '...';
            
            const embed = new EmbedBuilder()
                .setTitle(`📚 ${definition.word}`)
                .setDescription(desc)
                .addFields(
                    { name: '👍 Thumbs Up', value: definition.thumbs_up.toString(), inline: true },
                    { name: '👎 Thumbs Down', value: definition.thumbs_down.toString(), inline: true }
                )
                .setColor('#FF4500')
                .setFooter({ text: `By ${definition.author}` })
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Urban Dictionary API error:', error);
            message.reply('Failed to fetch definition!');
        }
    }
};
