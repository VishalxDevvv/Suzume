const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time (e.g., 5m, 1h, 2d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Reminder message')
                .setRequired(true)),
    
    async execute(interaction) {
        const timeString = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        
        const timeRegex = /^(\d+)([smhd])$/;
        const match = timeString.match(timeRegex);
        
        if (!match) {
            return await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Invalid time format. Use: 5m, 1h, 2d`, ephemeral: true });
        }
        
        const amount = parseInt(match[1]);
        const unit = match[2];
        
        let milliseconds;
        switch (unit) {
            case 's': milliseconds = amount * 1000; break;
            case 'm': milliseconds = amount * 60 * 1000; break;
            case 'h': milliseconds = amount * 60 * 60 * 1000; break;
            case 'd': milliseconds = amount * 24 * 60 * 60 * 1000; break;
        }
        
        if (milliseconds > 7 * 24 * 60 * 60 * 1000) {
            return await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Maximum reminder time is 7 days.`, ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.LOADING} Reminder Set`)
            .setColor(ROYAL_COLORS.EMERALD)
            .addFields(
                { name: '⏰ Time', value: timeString, inline: true },
                { name: '📝 Message', value: message, inline: true },
                { name: '📅 Remind At', value: `<t:${Math.floor((Date.now() + milliseconds) / 1000)}:F>`, inline: false }
            )
            .setFooter({ text: '© Vishal\'s Royal Bot • I won\'t forget!' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        setTimeout(async () => {
            const reminderEmbed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.BULB} Reminder`)
                .setColor(ROYAL_COLORS.GOLD)
                .setDescription(`📝 ${message}`)
                .addFields(
                    { name: '⏰ Set', value: `<t:${Math.floor(Date.now() / 1000 - milliseconds / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Time\'s up!' })
                .setTimestamp();
            
            try {
                await interaction.followUp({ content: `<@${interaction.user.id}>`, embeds: [reminderEmbed] });
            } catch (error) {
                console.log('Failed to send reminder:', error);
            }
        }, milliseconds);
    },
};
