const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_EMOJIS } = require('../royalStyles');

// 8ball responses
const eightBallResponses = [
    // Positive responses
    "🟢 It is certain",
    "🟢 It is decidedly so",
    "🟢 Without a doubt",
    "🟢 Yes definitely",
    "🟢 You may rely on it",
    "🟢 As I see it, yes",
    "🟢 Most likely",
    "🟢 Outlook good",
    "🟢 Yes",
    "🟢 Signs point to yes",
    
    // Neutral/uncertain responses
    "🟡 Reply hazy, try again",
    "🟡 Ask again later",
    "🟡 Better not tell you now",
    "🟡 Cannot predict now",
    "🟡 Concentrate and ask again",
    
    // Negative responses
    "🔴 Don't count on it",
    "🔴 My reply is no",
    "🔴 My sources say no",
    "🔴 Outlook not so good",
    "🔴 Very doubtful"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Asks the magic 8-ball a question.')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask the 8-ball')
                .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        
        // Get random response
        const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
        
        const eightBallEmbed = new EmbedBuilder()
            .setColor(0x9932CC)
            .setTitle(`${ROYAL_EMOJIS.CUTE} Magic 8-Ball`)
            .addFields(
                { name: '❓ Question', value: question, inline: false },
                { name: '🔮 Answer', value: randomResponse, inline: false }
            )
            .setFooter({ text: `Asked by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [eightBallEmbed] });
    },
};