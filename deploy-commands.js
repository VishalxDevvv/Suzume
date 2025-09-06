const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    // Basic commands
    { name: 'ping', description: 'Check bot latency' },
    { name: 'hello', description: 'Get a greeting message' },
    { name: 'botinfo', description: 'Show bot information and statistics' },
    { name: 'help', description: 'Show all available commands' },
    { name: 'invite', description: 'Get bot invite links' },
    
    // Moderation commands
    {
        name: 'ban',
        description: 'Ban a user from the server',
        options: [
            { name: 'user', description: 'The user to ban', type: 6, required: true },
            { name: 'reason', description: 'Reason for the ban', type: 3, required: false }
        ]
    },
    {
        name: 'unban',
        description: 'Unban a user from the server',
        options: [
            { name: 'user_id', description: 'The user ID to unban', type: 3, required: true }
        ]
    },
    {
        name: 'kick',
        description: 'Kick a user from the server',
        options: [
            { name: 'user', description: 'The user to kick', type: 6, required: true },
            { name: 'reason', description: 'Reason for the kick', type: 3, required: false }
        ]
    },
    {
        name: 'timeout',
        description: 'Timeout a user',
        options: [
            { name: 'user', description: 'The user to timeout', type: 6, required: true },
            { name: 'duration', description: 'Duration (e.g., 10m, 1h, 1d)', type: 3, required: true },
            { name: 'reason', description: 'Reason for timeout', type: 3, required: false }
        ]
    },
    {
        name: 'untimeout',
        description: 'Remove timeout from a user',
        options: [
            { name: 'user', description: 'The user to remove timeout from', type: 6, required: true }
        ]
    },
    
    // Utility commands
    {
        name: 'userinfo',
        description: 'Get information about a user',
        options: [{ name: 'user', description: 'The user to get info about', type: 6, required: false }]
    },
    {
        name: 'avatar',
        description: 'Get a user\'s avatar',
        options: [{ name: 'user', description: 'The user to get avatar of', type: 6, required: false }]
    },
    {
        name: 'serverinfo',
        description: 'Get information about the server'
    },
    
    // Level system
    {
        name: 'level',
        description: 'Check user level and XP',
        options: [{ name: 'user', description: 'User to check', type: 6, required: false }]
    },
    {
        name: 'leaderboard',
        description: 'Show server XP leaderboard',
        options: [{ name: 'limit', description: 'Number of users to show (1-20)', type: 4, required: false }]
    },
    {
        name: 'setlevelrole',
        description: 'Set a role for a specific level (Admin only)',
        options: [
            { name: 'level', description: 'Level number', type: 4, required: true },
            { name: 'role', description: 'Role to assign', type: 8, required: true }
        ]
    },
    {
        name: 'removelevelrole',
        description: 'Remove a level role (Admin only)',
        options: [
            { name: 'level', description: 'Level number', type: 4, required: true }
        ]
    },
    {
        name: 'levelroles',
        description: 'Show all configured level roles'
    },
    
    // API commands
    {
        name: 'weather',
        description: 'Get weather information for a city',
        options: [{ name: 'city', description: 'City name', type: 3, required: true }]
    },
    {
        name: 'crypto',
        description: 'Get cryptocurrency price information',
        options: [{ name: 'coin', description: 'Cryptocurrency name or symbol', type: 3, required: true }]
    },
    {
        name: 'movie',
        description: 'Search for movie information',
        options: [{ name: 'title', description: 'Movie title', type: 3, required: true }]
    },
    {
        name: 'nasa',
        description: 'Get NASA Astronomy Picture of the Day'
    },
    {
        name: 'color',
        description: 'Get information about a color',
        options: [{ name: 'hex', description: 'Hex color code (without #)', type: 3, required: true }]
    },
    {
        name: 'urban',
        description: 'Look up Urban Dictionary definition',
        options: [{ name: 'term', description: 'Term to look up', type: 3, required: true }]
    },
    {
        name: 'qr',
        description: 'Generate QR code',
        options: [{ name: 'text', description: 'Text to encode in QR code', type: 3, required: true }]
    },
    {
        name: 'password',
        description: 'Generate a secure password',
        options: [{ name: 'length', description: 'Password length (4-50)', type: 4, required: false }]
    },
    {
        name: 'dictionary',
        description: 'Look up word definitions',
        options: [{ name: 'word', description: 'Word to define', type: 3, required: true }]
    },
    {
        name: 'translate',
        description: 'Translate text to another language',
        options: [
            { name: 'text', description: 'Text to translate', type: 3, required: true },
            { name: 'to', description: 'Target language code', type: 3, required: true }
        ]
    },
    
    // Fun commands
    { name: 'joke', description: 'Get a random joke' },
    { name: 'quote', description: 'Get an inspirational quote' },
    { name: 'fact', description: 'Get a random interesting fact' },
    { name: 'advice', description: 'Get random life advice' },
    { name: 'meme', description: 'Get a random meme' },
    { name: 'cat', description: 'Get a random cat image' },
    { name: 'dog', description: 'Get a random dog image' },
    
    // Animal commands
    { name: 'randombird', description: 'Get a random bird image' },
    { name: 'randomfox', description: 'Get a random fox image' },
    { name: 'randomduck', description: 'Get a random duck image' },
    
    // Game commands
    { name: 'trivia', description: 'Get a trivia question' },
    { name: 'truth', description: 'Get a truth question for truth or dare' },
    { name: 'dare', description: 'Get a dare challenge for truth or dare' },
    { name: 'wyr', description: 'Get a would you rather question' },
    { name: 'nhie', description: 'Get a never have I ever question' },
    { name: 'coinflip', description: 'Flip a coin' },
    { name: 'diceroll', description: 'Roll a dice' },
    {
        name: 'rps',
        description: 'Play rock paper scissors',
        options: [{ name: 'choice', description: 'Your choice', type: 3, required: true, choices: [
            { name: 'Rock', value: 'rock' },
            { name: 'Paper', value: 'paper' },
            { name: 'Scissors', value: 'scissors' }
        ]}]
    },
    {
        name: '8ball',
        description: 'Ask the magic 8-ball a question',
        options: [{ name: 'question', description: 'Your question for the 8-ball', type: 3, required: true }]
    },
    {
        name: 'ship',
        description: 'Calculate love compatibility between two people',
        options: [
            { name: 'person1', description: 'First person', type: 6, required: true },
            { name: 'person2', description: 'Second person', type: 6, required: false }
        ]
    },
    
    // Anime interaction commands
    {
        name: 'hug',
        description: 'Hug someone',
        options: [{ name: 'user', description: 'User to hug', type: 6, required: false }]
    },
    {
        name: 'kiss',
        description: 'Kiss someone',
        options: [{ name: 'user', description: 'User to kiss', type: 6, required: false }]
    },
    {
        name: 'pat',
        description: 'Pat someone on the head',
        options: [{ name: 'user', description: 'User to pat', type: 6, required: false }]
    },
    {
        name: 'slap',
        description: 'Slap someone',
        options: [{ name: 'user', description: 'User to slap', type: 6, required: false }]
    },
    {
        name: 'cuddle',
        description: 'Cuddle with someone',
        options: [{ name: 'user', description: 'User to cuddle with', type: 6, required: false }]
    },
    {
        name: 'poke',
        description: 'Poke someone',
        options: [{ name: 'user', description: 'User to poke', type: 6, required: false }]
    },
    {
        name: 'tickle',
        description: 'Tickle someone',
        options: [{ name: 'user', description: 'User to tickle', type: 6, required: false }]
    },
    {
        name: 'feed',
        description: 'Feed someone',
        options: [{ name: 'user', description: 'User to feed', type: 6, required: false }]
    },
    {
        name: 'wink',
        description: 'Wink at someone',
        options: [{ name: 'user', description: 'User to wink at', type: 6, required: false }]
    },
    {
        name: 'punch',
        description: 'Punch someone',
        options: [{ name: 'user', description: 'User to punch', type: 6, required: false }]
    },
    {
        name: 'bite',
        description: 'Bite someone',
        options: [{ name: 'user', description: 'User to bite', type: 6, required: false }]
    },
    {
        name: 'wave',
        description: 'Wave at someone',
        options: [{ name: 'user', description: 'User to wave at', type: 6, required: false }]
    },
    
    // Emotion commands
    { name: 'cry', description: 'Show crying emotion' },
    { name: 'laugh', description: 'Show laughing emotion' },
    { name: 'smug', description: 'Show smug expression' },
    { name: 'dance', description: 'Show dancing animation' },
    { name: 'blush', description: 'Show blushing emotion' },
    { name: 'sleep', description: 'Show sleeping animation' },
    { name: 'smile', description: 'Show smiling emotion' }
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} global application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} global application (/) commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();
