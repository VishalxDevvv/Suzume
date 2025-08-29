const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock Paper Scissors with the bot'),
    
    async execute(interaction) {
        const choices = ['🪨', '📄', '✂️'];
        const choiceNames = ['Rock', 'Paper', 'Scissors'];
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rps_rock')
                    .setLabel('Rock')
                    .setEmoji('🪨')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rps_paper')
                    .setLabel('Paper')
                    .setEmoji('📄')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('rps_scissors')
                    .setLabel('Scissors')
                    .setEmoji('✂️')
                    .setStyle(ButtonStyle.Primary)
            );
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.ENTERTAINMENT} Rock Paper Scissors`)
            .setColor(ROYAL_COLORS.PURPLE)
            .setDescription('Choose your weapon!')
            .setFooter({ text: '© Vishal\'s Royal Bot • May the best choice win!' })
            .setTimestamp();
        
        const response = await interaction.reply({ embeds: [embed], components: [row] });
        
        const filter = i => i.user.id === interaction.user.id && i.customId.startsWith('rps_');
        const collector = response.createMessageComponentCollector({ filter, time: 30000 });
        
        collector.on('collect', async i => {
            const userChoice = i.customId.split('_')[1];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            const botChoiceName = choiceNames[choices.indexOf(botChoice)];
            
            let result;
            if (userChoice === 'rock' && botChoiceName === 'Scissors' ||
                userChoice === 'paper' && botChoiceName === 'Rock' ||
                userChoice === 'scissors' && botChoiceName === 'Paper') {
                result = `${ROYAL_EMOJIS.SUCCESS} You Win!`;
            } else if (userChoice === botChoiceName.toLowerCase()) {
                result = `${ROYAL_EMOJIS.LOADING} It's a Tie!`;
            } else {
                result = `${ROYAL_EMOJIS.ERROR} You Lose!`;
            }
            
            const resultEmbed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.ENTERTAINMENT} Rock Paper Scissors`)
                .setColor(ROYAL_COLORS.GOLD)
                .addFields(
                    { name: '👤 Your Choice', value: `${choices[choiceNames.indexOf(userChoice.charAt(0).toUpperCase() + userChoice.slice(1))]} ${userChoice.charAt(0).toUpperCase() + userChoice.slice(1)}`, inline: true },
                    { name: '🤖 Bot Choice', value: `${botChoice} ${botChoiceName}`, inline: true },
                    { name: '🏆 Result', value: result, inline: false }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Good game!' })
                .setTimestamp();
            
            await i.update({ embeds: [resultEmbed], components: [] });
        });
        
        collector.on('end', async () => {
            if (!collector.ended) {
                await interaction.editReply({ components: [] });
            }
        });
    },
};
