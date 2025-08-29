const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'trivia',
    description: 'Get a trivia question',
    async execute(message, args) {
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
            const data = await response.json();
            const question = data.results[0];
            
            const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
            const answerList = answers.map((answer, index) => `${String.fromCharCode(65 + index)}. ${answer}`).join('\n');
            
            const embed = new EmbedBuilder()
                .setTitle('🧠 Trivia Question')
                .setDescription(`**${question.question}**\n\n${answerList}`)
                .addFields({ name: 'Category', value: question.category, inline: true })
                .setColor('#FF1493')
                .setFooter({ text: 'Answer will be revealed in 10 seconds!' })
                .setTimestamp();
            
            const triviaMsg = await message.reply({ embeds: [embed] });
            
            setTimeout(() => {
                const answerEmbed = new EmbedBuilder()
                    .setTitle('ROYAL_EMOJIS.SUCCESS Correct Answer')
                    .setDescription(`**${question.correct_answer}**`)
                    .setColor('#00FF00');
                triviaMsg.edit({ embeds: [embed, answerEmbed] });
            }, 10000);
        } catch (error) {
            console.error('Trivia API error:', error);
            message.reply('Failed to fetch trivia question!');
        }
    }
};
