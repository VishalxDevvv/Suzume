const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const PrefixSystem = require('../../prefixSystem');

module.exports = {
    name: 'setprefix',
    aliases: ['prefix'],
    description: 'Set a custom prefix for this server',
    async execute(message, args) {
        // Check permissions
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply(`${ROYAL_EMOJIS.ERROR} You need **Manage Server** permission to change the prefix!`);
        }

        if (!args[0]) {
            const currentPrefix = PrefixSystem.getPrefix(message.guild.id);
            const embed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.SETTINGS} Server Prefix`,
                description: `**Current Prefix:** \`${currentPrefix}\`\n\n**Usage:** \`${currentPrefix}setprefix <new_prefix>\`\n\n**Examples:**\n\`${currentPrefix}setprefix !\` - Changes to !\n\`${currentPrefix}setprefix >>\` - Changes to >>\n\`${currentPrefix}setprefix s!\` - Changes to s!\n\n**Note:** Prefix can be 1-3 characters, no spaces`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                footer: { text: 'Economy commands work without any prefix!' }
            });
            return message.reply({ embeds: [embed] });
        }

        const newPrefix = args[0];
        const success = PrefixSystem.setPrefix(message.guild.id, newPrefix);

        if (!success) {
            return message.reply(`${ROYAL_EMOJIS.ERROR} Invalid prefix! Must be 1-3 characters with no spaces.`);
        }

        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.SUCCESS} Prefix Updated!`,
            description: `**New Prefix:** \`${newPrefix}\`\n\n**Examples:**\n\`${newPrefix}ping\` - Check bot latency\n\`${newPrefix}anime Naruto\` - Get anime info\n\`${newPrefix}cf 100 h\` - Coinflip bet\n\n**Prefix-Free Commands:**\n\`cash\` - Check balance\n\`daily\` - Claim rewards\n\`leaderboard\` - View top users`,
            color: ROYAL_COLORS.GREEN,
            footer: { text: 'Economy commands still work without prefix!' }
        });

        return message.reply({ embeds: [embed] });
    }
};
