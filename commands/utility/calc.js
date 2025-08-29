const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'calc',
    description: 'Calculate mathematical expressions',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a mathematical expression! Usage: `$calc <expression>`');
        }

        try {
            const expression = args.join(' ');
            
            // Basic security: only allow numbers, operators, parentheses, and spaces
            if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
                return message.reply('Invalid characters in expression! Only use numbers and basic operators (+, -, *, /, (), .)');
            }

            const result = eval(expression);
            
            if (!isFinite(result)) {
                return message.reply('Result is not a finite number!');
            }

            const embed = new EmbedBuilder()
                .setTitle('🧮 Calculator')
                .addFields(
                    { name: '📝 Expression', value: `\`${expression}\``, inline: false },
                    { name: 'ROYAL_EMOJIS.SUCCESS Result', value: `\`${result}\``, inline: false }
                )
                .setColor('#f59e0b')
                .setFooter({ text: 'Basic Calculator' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Calculator error:', error);
            message.reply('Invalid mathematical expression!');
        }
    }
};
