const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Delete multiple messages at once',
    async execute(message, args) {
        // Check if user has manage messages permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('ROYAL_EMOJIS.ERROR You need the "Manage Messages" permission to use this command!');
        }

        // Check if bot has manage messages permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('ROYAL_EMOJIS.ERROR I need the "Manage Messages" permission to delete messages!');
        }

        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100) {
            return message.reply('ROYAL_EMOJIS.ERROR Please provide a number between 1 and 100! Usage: `$purge <amount>`');
        }

        try {
            // Delete the command message first
            await message.delete();
            
            // Bulk delete messages
            const deleted = await message.channel.bulkDelete(amount, true);
            
            const embed = new EmbedBuilder()
                .setTitle('🧹 Messages Purged')
                .setDescription(`Successfully deleted **${deleted.size}** messages!`)
                .setColor('#00FF00')
                .setTimestamp();
            
            // Send confirmation and delete it after 5 seconds
            const confirmMsg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => confirmMsg.delete().catch(() => {}), 5000);
            
        } catch (error) {
            console.error('Purge error:', error);
            message.reply('ROYAL_EMOJIS.ERROR Failed to delete messages! Messages older than 14 days cannot be bulk deleted.');
        }
    }
};
