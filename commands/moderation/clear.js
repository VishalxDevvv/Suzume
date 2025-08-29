const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');
        
        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const filteredMessages = user ? messages.filter(msg => msg.author.id === user.id) : messages;
            
            await interaction.channel.bulkDelete(filteredMessages, true);
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.SUCCESS} Messages Cleared`)
                .setColor(ROYAL_COLORS.EMERALD)
                .addFields(
                    { name: '🗑️ Deleted', value: `${filteredMessages.size} messages`, inline: true },
                    { name: '👤 Filter', value: user ? user.tag : 'All users', inline: true },
                    { name: '⚖️ Moderator', value: interaction.user.tag, inline: true }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Channel cleaned' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to clear messages.`, ephemeral: true });
        }
    },
};
