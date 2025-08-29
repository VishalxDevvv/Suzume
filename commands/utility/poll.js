const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Poll options separated by | (max 10)')
                .setRequired(true)),
    
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options');
        const options = optionsString.split('|').map(opt => opt.trim()).slice(0, 10);
        
        if (options.length < 2) {
            return await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Please provide at least 2 options separated by |`, ephemeral: true });
        }
        
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.STATS} Poll: ${question}`)
            .setColor(ROYAL_COLORS.ROYAL_BLUE)
            .setDescription(options.map((option, index) => `${emojis[index]} ${option}`).join('\n'))
            .addFields(
                { name: '📊 Instructions', value: 'React with the corresponding emoji to vote!', inline: false }
            )
            .setFooter({ text: `© Vishal Royal Bot • Poll by ${interaction.user.tag}` })
            .setTimestamp();
        
        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        
        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    },
};
