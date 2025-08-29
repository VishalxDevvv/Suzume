const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

// Simple in-memory storage (use database in production)
const warnings = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        
        if (!warnings.has(user.id)) {
            warnings.set(user.id, []);
        }
        
        const userWarnings = warnings.get(user.id);
        userWarnings.push({
            reason,
            moderator: interaction.user.id,
            timestamp: Date.now()
        });
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.WARNING} User Warned`)
            .setColor(ROYAL_COLORS.BURGUNDY)
            .addFields(
                { name: '👤 User', value: `${user.tag} (${user.id})`, inline: true },
                { name: '⚖️ Moderator', value: interaction.user.tag, inline: true },
                { name: '📝 Reason', value: reason, inline: false },
                { name: '⚠️ Total Warnings', value: userWarnings.length.toString(), inline: true }
            )
            .setFooter({ text: '© Vishal\'s Royal Bot • Warning issued' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Try to DM the user
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.WARNING} Warning Received`)
                .setColor(ROYAL_COLORS.BURGUNDY)
                .addFields(
                    { name: '🏰 Server', value: interaction.guild.name, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Please follow server rules' })
                .setTimestamp();
            
            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            // User has DMs disabled
        }
    },
};
