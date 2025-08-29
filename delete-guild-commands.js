const { REST, Routes } = require('discord.js');
require('dotenv').config();

// If you need to delete guild-specific commands, add GUILD_ID to your .env file
const GUILD_ID = process.env.GUILD_ID;

if (!GUILD_ID) {
    console.log('❌ GUILD_ID not found in .env file.');
    console.log('${ROYAL_EMOJIS.BULB} Add GUILD_ID=your_server_id to .env file if you want to delete guild-specific commands.');
    process.exit(1);
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Delete all guild-specific commands
(async () => {
    try {
        console.log(`🗑️  Started deleting all guild commands for server: ${GUILD_ID}...`);

        // Get all existing guild commands
        const existingCommands = await rest.get(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID)
        );

        console.log(`${ROYAL_EMOJIS.STATS} Found ${existingCommands.length} existing guild commands.`);

        if (existingCommands.length === 0) {
            console.log('✅ No guild commands found to delete.');
            return;
        }

        // Delete all guild commands by setting an empty array
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID),
            { body: [] }
        );

        console.log('✅ Successfully deleted all guild application (/) commands.');
        console.log('⚡ Guild commands are deleted immediately.');
        
        // List the commands that were deleted
        console.log('\n📋 Deleted guild commands:');
        existingCommands.forEach(cmd => {
            console.log(`   - /${cmd.name}: ${cmd.description}`);
        });

    } catch (error) {
        console.error('❌ Error deleting guild commands:', error);
        
        if (error.code === 50001) {
            console.log('${ROYAL_EMOJIS.BULB} Make sure your bot token has the applications.commands scope.');
        } else if (error.code === 10002) {
            console.log('${ROYAL_EMOJIS.BULB} Make sure your CLIENT_ID and GUILD_ID are correct in the .env file.');
        } else if (error.code === 50013) {
            console.log('${ROYAL_EMOJIS.BULB} Make sure your bot has permission to manage commands in this server.');
        }
    }
})();
