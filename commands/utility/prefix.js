const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'prefix',
    description: 'Change bot prefix (Admin only)',
    async execute(message, args) {
        // Check if user has admin permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('ROYAL_EMOJIS.ERROR You need Administrator permission to change the prefix!');
        }

        if (!args[0]) {
            return message.reply(`Current prefix: \`${process.env.BOT_PREFIX}\`\nUsage: \`${process.env.BOT_PREFIX}prefix <new prefix>\``);
        }

        const newPrefix = args[0];
        
        if (newPrefix.length > 5) {
            return message.reply('ROYAL_EMOJIS.ERROR Prefix must be 5 characters or less!');
        }

        try {
            // Update .env file
            let envContent = fs.readFileSync('.env', 'utf8');
            envContent = envContent.replace(/BOT_PREFIX=.*/g, `BOT_PREFIX=${newPrefix}`);
            fs.writeFileSync('.env', envContent);
            
            // Update process.env
            process.env.BOT_PREFIX = newPrefix;

            const embed = new EmbedBuilder()
                .setTitle('ROYAL_EMOJIS.SUCCESS Prefix Changed!')
                .setDescription(`Bot prefix has been changed to: \`${newPrefix}\`\n\n**Note:** Restart the bot for full effect.`)
                .setColor('#00FF00')
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Prefix change error:', error);
            message.reply('ROYAL_EMOJIS.ERROR Failed to change prefix!');
        }
    }
};
