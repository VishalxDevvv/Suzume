const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bored')
        .setDescription('Get a random activity suggestion when you\'re bored')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of activity')
                .addChoices(
                    { name: 'Education', value: 'education' },
                    { name: 'Recreational', value: 'recreational' },
                    { name: 'Social', value: 'social' },
                    { name: 'DIY', value: 'diy' },
                    { name: 'Charity', value: 'charity' },
                    { name: 'Cooking', value: 'cooking' },
                    { name: 'Relaxation', value: 'relaxation' },
                    { name: 'Music', value: 'music' },
                    { name: 'Busywork', value: 'busywork' }
                )),
    
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const url = type ? `https://www.boredapi.com/api/activity?type=${type}` : 'https://www.boredapi.com/api/activity';
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.ROCKET} Activity Suggestion`)
                .setColor(ROYAL_COLORS.GOLD)
                .addFields(
                    { name: '🎯 Activity', value: data.activity, inline: false },
                    { name: '📂 Type', value: data.type.charAt(0).toUpperCase() + data.type.slice(1), inline: true },
                    { name: '👥 Participants', value: data.participants.toString(), inline: true },
                    { name: '💰 Price', value: data.price === 0 ? 'Free' : `${Math.round(data.price * 100)}%`, inline: true }
                )
                .setFooter({ text: '© Vishal Royal Bot • Powered by API' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to get activity suggestion.`, ephemeral: true });
        }
    },
};
