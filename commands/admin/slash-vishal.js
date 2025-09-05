const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vishal')
        .setDescription('Information about the bot owner'),
    async execute(interaction) {
        const embed = RoyalStyler.createRoyalEmbed({
            title: `✨ <a:Diamond:1412004332487835708> Vishal <a:Diamond:1412004332487835708> ✨`,
            description: `*Builder of projects that matter*\n*Learning, growing, moving forward*\n*Creating today with tomorrow in mind*\n\n✨ Owner of Suzume\n\n<a:gem:1412006973758767174> **Links**\n[GitHub](https://github.com/VishalxDevvv) • [Email](mailto:04vishal.com@gmail.com) • [Links](https://guns.lol/vishalxdev)\n\n<a:sparkles:1412004805517381732> **${interaction.client.guilds.cache.size}** servers • **80+** commands`,
            color: ROYAL_COLORS.PURPLE,
            footer: { text: 'Made with <3 by Vishal' }
        });

        await interaction.reply({ embeds: [embed] });
    },
};
