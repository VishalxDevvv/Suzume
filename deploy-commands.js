const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    // Basic commands
    { name: 'ping', description: 'Replies with Pong!' },
    { name: 'hello', description: 'Replies with a greeting' },
    { name: 'botinfo', description: 'Shows information about the bot' },
    
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
    
    // API commands
    {
        name: 'weather',
        description: 'Get weather information',
        options: [{ name: 'city', description: 'City name', type: 3, required: true }]
    },
    {
        name: 'crypto',
        description: 'Get cryptocurrency price',
        options: [{ name: 'coin', description: 'Cryptocurrency name', type: 3, required: true }]
    },
    {
        name: 'color',
        description: 'Get color information',
        options: [{ name: 'hex', description: 'Hex color code', type: 3, required: true }]
    },
    {
        name: 'urban',
        description: 'Look up Urban Dictionary definition',
        options: [{ name: 'term', description: 'Term to look up', type: 3, required: true }]
    },
    {
        name: 'qr',
        description: 'Generate QR code',
        options: [{ name: 'text', description: 'Text to encode', type: 3, required: true }]
    },
    {
        name: 'password',
        description: 'Generate secure password',
        options: [{ name: 'length', description: 'Password length (4-50)', type: 4, required: false }]
    },
    
    // Fun commands
    { name: 'joke', description: 'Get a random joke' },
    { name: 'quote', description: 'Get an inspirational quote' },
    { name: 'fact', description: 'Get a random fact' },
    { name: 'advice', description: 'Get life advice' },
    { name: 'meme', description: 'Get a random meme' },
    { name: 'cat', description: 'Get a random cat image' },
    { name: 'dog', description: 'Get a random dog image' },
    { name: 'trivia', description: 'Get a trivia question' },
    
    // Game commands
    { name: 'truth', description: 'Get a truth question' },
    { name: 'dare', description: 'Get a dare challenge' },
    { name: 'wyr', description: 'Get a would you rather question' },
    { name: 'nhie', description: 'Get a never have I ever question' },
    {
        name: '8ball',
        description: 'Ask the magic 8-ball',
        options: [{ name: 'question', description: 'Your question', type: 3, required: true }]
    },
    {
        name: 'ship',
        description: 'Calculate love compatibility',
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
        description: 'Pat someone',
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
        options: [{ name: 'user', description: 'User to cuddle', type: 6, required: false }]
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
    
    // Level system
    {
        name: 'level',
        description: 'Check user level',
        options: [{ name: 'user', description: 'User to check', type: 6, required: false }]
    },
    {
        name: 'leaderboard',
        description: 'Show server leaderboard',
        options: [{ name: 'limit', description: 'Number of users to show (1-20)', type: 4, required: false }]
    },
    
    // Utility
    { name: 'invite', description: 'Get bot invite links' }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
