const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'invite',
    description: 'Get bot invite link',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 Invite Me!')
            .setDescription('Choose how you want to add me:')
            .addFields(
                {
                    name: '🏠 Add to Server',
                    value: '[Click here to add me to your server!](https://discord.com/oauth2/authorize?client_id=1405786021253353502&permissions=8&scope=bot)',
                    inline: false
                },
                {
                    name: '👤 Install as User App',
                    value: '[Click here to install as user app!](https://discord.com/oauth2/authorize?client_id=1405786021253353502&scope=applications.commands)',
                    inline: false
                }
            )
            .setColor('#00FF00')
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: 'Thanks for using our bot!' })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
};
