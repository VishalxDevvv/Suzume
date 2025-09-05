const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROYAL_EMOJIS } = require('../royalStyles');

// Ship compatibility messages
const shipMessages = {
    0: "💔 No chemistry at all...",
    10: "😐 Just friends, nothing more",
    20: "🤝 Good friends, maybe?",
    30: "😊 There's some potential here",
    40: "${ROYAL_EMOJIS.HEART} Cute together!",
    50: "${ROYAL_EMOJIS.HEART} Perfect match!",
    60: "💝 Made for each other!",
    70: "💞 Soulmates detected!",
    80: "💘 Love is in the air!",
    90: "${ROYAL_EMOJIS.STAR} Absolutely perfect!",
    100: "${ROYAL_EMOJIS.SPARKLES}${ROYAL_EMOJIS.HEART} ULTIMATE LOVE MATCH! ${ROYAL_EMOJIS.HEART}${ROYAL_EMOJIS.SPARKLES}"
};

// Function to calculate ship percentage
function calculateShipPercentage(name1, name2) {
    // Create a consistent hash based on the two names
    const combined = (name1.toLowerCase() + name2.toLowerCase()).split('').sort().join('');
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to percentage (0-100)
    return Math.abs(hash) % 101;
}

// Function to get ship message based on percentage
function getShipMessage(percentage) {
    if (percentage === 100) return shipMessages[100];
    if (percentage >= 90) return shipMessages[90];
    if (percentage >= 80) return shipMessages[80];
    if (percentage >= 70) return shipMessages[70];
    if (percentage >= 60) return shipMessages[60];
    if (percentage >= 50) return shipMessages[50];
    if (percentage >= 40) return shipMessages[40];
    if (percentage >= 30) return shipMessages[30];
    if (percentage >= 20) return shipMessages[20];
    if (percentage >= 10) return shipMessages[10];
    return shipMessages[0];
}

// Function to create ship name
function createShipName(name1, name2) {
    const half1 = name1.slice(0, Math.ceil(name1.length / 2));
    const half2 = name2.slice(Math.floor(name2.length / 2));
    return half1 + half2;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Calculates the compatibility between two users.')
        .addUserOption(option =>
            option.setName('person1')
                .setDescription('The first person')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('person2')
                .setDescription('The second person (defaults to yourself if not provided)')),
    async execute(interaction) {
        const person1User = interaction.options.getUser('person1');
        const person2User = interaction.options.getUser('person2');
        
        let person1, person2;
        
        if (person2User) {
            // Two users provided
            person1 = person1User.username;
            person2 = person2User.username;
        } else {
            // Only one user provided, ship with command author
            person1 = interaction.user.username;
            person2 = person1User.username;
        }

        // Calculate ship percentage
        const percentage = calculateShipPercentage(person1, person2);
        const shipName = createShipName(person1, person2);
        const message_text = getShipMessage(percentage);
        
        // Create progress bar
        const filledBars = Math.floor(percentage / 10);
        const emptyBars = 10 - filledBars;
        const progressBar = `${ROYAL_EMOJIS.HEART}`.repeat(filledBars) + '🤍'.repeat(emptyBars);
        
        // Determine embed color based on percentage
        let embedColor;
        if (percentage >= 80) embedColor = 0xFF1493; // Deep pink
        else if (percentage >= 60) embedColor = 0xFF69B4; // Hot pink
        else if (percentage >= 40) embedColor = 0xFFC0CB; // Pink
        else if (percentage >= 20) embedColor = 0xDDA0DD; // Plum
        else embedColor = 0x808080; // Gray

        const shipEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${ROYAL_EMOJIS.HEART} Love Calculator ${ROYAL_EMOJIS.HEART}`)
            .addFields(
                { name: '👫 Couple', value: `**${person1}** x **${person2}**`, inline: false },
                { name: `${ROYAL_EMOJIS.HEART} Ship Name`, value: `**${shipName}**`, inline: true },
                { name: `${ROYAL_EMOJIS.STAR} Love Percentage`, value: `**${percentage}%**`, inline: true },
                { name: `${ROYAL_EMOJIS.STATS} Love Meter`, value: progressBar, inline: false },
                { name: '💌 Result', value: message_text, inline: false }
            )
            .setFooter({ text: `Shipped by ${interaction.user.username} | Results may vary 😉` })
            .setTimestamp();


        await interaction.reply({ embeds: [shipEmbed] });
    },
};