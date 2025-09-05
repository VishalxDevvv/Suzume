const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandNames = new Set();

// Function to load slash commands from directories
function loadSlashCommands(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const itemPath = path.join(dir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            loadSlashCommands(itemPath);
        } else if (item.startsWith('slash-') && item.endsWith('.js')) {
            try {
                const command = require(`./${path.relative(__dirname, itemPath)}`);
                if (command.data) {
                    const commandName = command.data.name;
                    if (!commandNames.has(commandName)) {
                        commands.push(command.data.toJSON());
                        commandNames.add(commandName);
                        console.log(`✅ Loaded slash command: ${commandName}`);
                    } else {
                        console.log(`⚠️  Skipped duplicate: ${commandName} (from ${itemPath})`);
                    }
                }
            } catch (error) {
                console.error(`❌ Error loading ${itemPath}:`, error.message);
            }
        }
    }
}

// Load all slash commands
if (fs.existsSync('./commands')) {
    loadSlashCommands('./commands');
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`\n🚀 Started refreshing ${commands.length} unique application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`\n✅ Successfully reloaded ${data.length} application (/) commands.`);
        console.log('\n📋 Deployed commands:');
        data.forEach(cmd => console.log(`   • /${cmd.name} - ${cmd.description}`));
        
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
