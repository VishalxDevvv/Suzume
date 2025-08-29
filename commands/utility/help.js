const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with bot commands')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Command category')
                .addChoices(
                    { name: 'Moderation', value: 'moderation' },
                    { name: 'Utility', value: 'utility' },
                    { name: 'Games', value: 'games' },
                    { name: 'API', value: 'api' },
                    { name: 'Fun', value: 'fun' },
                    { name: 'Animals', value: 'animals' },
                    { name: 'Social', value: 'social' }
                )),
    
    async execute(interaction) {
        const category = interaction.options.getString('category');
        
        if (!category) {
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.CROWN} Royal Bot Commands`)
                .setColor(ROYAL_COLORS.ROYAL_BLUE)
                .setDescription('Select a category to view commands')
                .addFields(
                    { name: '🛡️ Moderation', value: 'Ban, kick, timeout, clear, automod', inline: true },
                    { name: '🔧 Utility', value: 'Help, serverinfo, userinfo, poll, remind, afk', inline: true },
                    { name: '🎮 Games', value: 'RPS, trivia, truth/dare, 8ball', inline: true },
                    { name: '🌐 API', value: 'Weather, crypto, jokes, facts, quotes', inline: true },
                    { name: '😄 Fun', value: 'Hug, pat, dance, reactions', inline: true },
                    { name: '🐾 Animals', value: 'Cat, dog, fox, bird pics', inline: true }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Your all-in-one Discord companion' })
                .setTimestamp();
            
            return await interaction.reply({ embeds: [embed] });
        }
        
        const categoryCommands = {
            moderation: '`/ban` `/kick` `/timeout` `/clear` `/automod`',
            utility: '`/help` `/serverinfo` `/userinfo` `/poll` `/remind` `/afk`',
            games: '`/rps` `/trivia` `/truth` `/dare` `/8ball` `/coinflip`',
            api: '`/weather` `/crypto` `/joke` `/fact` `/quote` `/agify` `/bored`',
            fun: '`/hug` `/pat` `/dance` `/kiss` `/poke` `/tickle`',
            animals: '`/cat` `/dog` `/fox` `/bird` `/randomcat` `/randomdog`',
            social: '`/level` `/leaderboard` `/movie` `/anime` `/meme`'
        };
        
        const embed = new EmbedBuilder()
            .setTitle(`${ROYAL_EMOJIS.BULB} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
            .setColor(ROYAL_COLORS.PURPLE)
            .setDescription(categoryCommands[category] || 'No commands found')
            .setFooter({ text: '© Vishal\'s Royal Bot • Detailed command help' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};
