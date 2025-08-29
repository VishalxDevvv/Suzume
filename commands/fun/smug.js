const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'smug',
    description: 'Show smug expression',
    async execute(message, args) {
        try {
            let response = await fetch('https://nekos.life/api/v2/img/smug');
            if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
                response = await fetch('https://nekos.life/api/v2/img/pat');
            }
            
            const data = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('😏 Smug!')
                .setDescription(`${message.author} looks smug!`)
                .setImage(data.url)
                .setColor('#9370DB')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Smug API error:', error);
            
            const embed = new EmbedBuilder()
                .setTitle('😏 Smug!')
                .setDescription(`${message.author} looks smug! *smirks confidently* 😏✨\n\n"I knew it~" 😎`)
                .setColor('#9370DB')
                .setTimestamp();
            
            message.reply({ embeds: [embed] });
        }
    }
};
