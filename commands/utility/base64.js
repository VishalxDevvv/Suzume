const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'base64',
    description: 'Encode or decode base64 text',
    async execute(message, args) {
        if (!args[0] || !args[1]) {
            return message.reply('Usage: `$base64 <encode/decode> <text>`');
        }

        try {
            const action = args[0].toLowerCase();
            const text = args.slice(1).join(' ');
            let result;

            if (action === 'encode' || action === 'e') {
                result = Buffer.from(text, 'utf8').toString('base64');
            } else if (action === 'decode' || action === 'd') {
                result = Buffer.from(text, 'base64').toString('utf8');
            } else {
                return message.reply('Invalid action! Use `encode` or `decode`');
            }

            const embed = new EmbedBuilder()
                .setTitle(`🔐 Base64 ${action.charAt(0).toUpperCase() + action.slice(1)}`)
                .addFields(
                    { name: '📝 Input', value: `\`\`\`${text.substring(0, 500)}\`\`\``, inline: false },
                    { name: 'ROYAL_EMOJIS.SUCCESS Output', value: `\`\`\`${result.substring(0, 500)}\`\`\``, inline: false }
                )
                .setColor('#10b981')
                .setFooter({ text: 'Base64 Encoder/Decoder' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Base64 error:', error);
            message.reply('Failed to encode/decode! Make sure the input is valid.');
        }
    }
};
