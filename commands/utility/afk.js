const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

// Simple in-memory storage (use database in production)
const afkUsers = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set yourself as AFK')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for being AFK')),
    
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const userId = interaction.user.id;
        
        afkUsers.set(userId, {
            reason: reason,
            timestamp: Date.now()
        });
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.LOADING} AFK Status Set`)
            .setColor(ROYAL_COLORS.MIDNIGHT)
            .addFields(
                { name: '👤 User', value: interaction.user.tag, inline: true },
                { name: '📝 Reason', value: reason, inline: true },
                { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            )
            .setFooter({ text: '© Vishal\'s Royal Bot • See you soon!' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Try to add [AFK] to nickname
        try {
            const member = await interaction.guild.members.fetch(userId);
            if (!member.nickname?.startsWith('[AFK]')) {
                await member.setNickname(`[AFK] ${member.displayName}`);
            }
        } catch (error) {
            // Ignore if can't change nickname
        }
    },
    
    // Export the afkUsers map for use in message handler
    afkUsers
};
