const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'testwelcome',
    description: 'Test the welcome message',
    execute(message, args) {
        const greeting = RoyalStyler.createRoyalEmbed({
            title: 'Greetings <:Alp_greet:1410660404404813826>',
            description: `<:Alp_greet:1410660404404813826> Greetings, ${message.author.username}!\n\nWelcome to **${message.guild.name}**!\n\nMay your presence bring honor and prosperity to our community!`,
            color: ROYAL_COLORS.GOLD,
            thumbnail: message.author.displayAvatarURL({ size: 256 }),
            footer: {
                text: 'Your Humble Assistant'
            }
        });
        message.reply({ embeds: [greeting] });
    }
};
