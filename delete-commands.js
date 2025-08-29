const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Delete all global commands
(async () => {
    try {
        console.log('🗑️  Started deleting all global application (/) commands...');

        // Get all existing global commands
        const existingCommands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );

        console.log(`${ROYAL_EMOJIS.STATS} Found ${existingCommands.length} existing global commands.`);

        if (existingCommands.length === 0) {
            console.log('✅ No global commands found to delete.');
            return;
        }

        // Delete all commands by setting an empty array
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );

        console.log('✅ Successfully deleted all global application (/) commands.');
        console.log('⏰ Note: It may take up to 1 hour for changes to propagate across all servers.');
        
        // List the commands that were deleted
        console.log('\n📋 Deleted commands:');
        existingCommands.forEach(cmd => {
            console.log(`   - /${cmd.name}: ${cmd.description}`);
        });

    } catch (error) {
        console.error('❌ Error deleting commands:', error);
        
        if (error.code === 50001) {
            console.log('${ROYAL_EMOJIS.BULB} Make sure your bot token has the applications.commands scope.');
        } else if (error.code === 10002) {
            console.log('${ROYAL_EMOJIS.BULB} Make sure your CLIENT_ID is correct in the .env file.');
        }
    }
})();
