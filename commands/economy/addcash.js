const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const Economy = require('../../economy');

module.exports = {
    name: 'addcash',
    aliases: ['givecash', 'adminmoney'],
    description: 'Add cash to account (Vishal only)',
    async execute(message, args) {
        // Only allow Vishal to use this command
        if (message.author.id !== '1269984634771607616') {
            return message.reply(`${ROYAL_EMOJIS.ERROR} This command is for Vishal only! 😏`);
        }

        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) {
            return message.reply(`Usage: \`addcash <amount>\`\nExample: \`addcash 10000\``);
        }

        const userId = message.author.id;
        const oldBalance = Economy.getUser(userId).balance;
        Economy.updateBalance(userId, amount);
        const newBalance = Economy.getUser(userId).balance;

        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.SUCCESS} Cash Added!`,
            description: `<a:cash:1412109414516789380> **+${amount.toLocaleString()}** suzu cash added!\n\n**Old Balance:** ${oldBalance.toLocaleString()}\n**New Balance:** ${newBalance.toLocaleString()}`,
            color: ROYAL_COLORS.GREEN,
            footer: { text: 'Admin privileges activated ✨' }
        });

        // Delete the original command message for security
        try {
            await message.delete();
        } catch (error) {
            // Ignore if can't delete (missing permissions)
        }

        const reply = await message.channel.send({ embeds: [embed] });
        
        // Auto-delete the reply after 10 seconds
        setTimeout(async () => {
            try {
                await reply.delete();
            } catch (error) {
                // Ignore if already deleted
            }
        }, 10000);

        return;
    }
};
