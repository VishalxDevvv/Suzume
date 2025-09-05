const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const Economy = require('../../economy');

const cooldowns = new Map();
const dailyLimits = new Map();

module.exports = {
    name: 'give',
    aliases: ['gift', 'send'],
    description: 'Gift suzu cash to friends - sz give @user <amount>',
    async execute(message, args) {
        const userId = message.author.id;
        const now = Date.now();
        const cooldownAmount = 5000; // 5 seconds
        const dailyLimit = 50000; // 50k daily limit

        // Check cooldown
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`🌸 Patience, dear~ Wait ${timeLeft.toFixed(1)}s before gifting again! 💖`);
            }
        }

        // Parse arguments - find amount after the mention
        const target = message.mentions.users.first();
        let amount = 0;
        
        // Find the amount in args (skip mention tokens)
        for (let i = 0; i < args.length; i++) {
            const parsed = parseInt(args[i]);
            if (!isNaN(parsed) && parsed > 0) {
                amount = parsed;
                break;
            }
        }

        if (!target) {
            return message.reply(`🌸 Who are you gifting to? Use: \`sz give @friend 1000\` 💖`);
        }

        if (!amount || amount <= 0) {
            return message.reply(`🌸 How much are you giving? Use: \`sz give @friend 1000\` 💖`);
        }

        if (target.id === userId) {
            return message.reply(`🌸 You can't gift yourself, silly~ Find a friend to share with! 💖`);
        }

        if (target.bot) {
            return message.reply(`🌸 Bots don't need suzu cash, dear~ Gift a real friend instead! 💖`);
        }

        // Check balance
        const giver = Economy.getUser(userId);
        if (giver.balance < amount) {
            return message.reply(`🌸 You only have ${giver.balance.toLocaleString()} suzu cash~ Can't give what you don't have! 💖`);
        }

        // Check daily limit
        const today = new Date().toDateString();
        const dailyKey = `${userId}-${today}`;
        const todayGiven = dailyLimits.get(dailyKey) || 0;

        if (todayGiven + amount > dailyLimit) {
            const remaining = dailyLimit - todayGiven;
            return message.reply(`🌸 Daily gift limit reached! You can still give ${remaining.toLocaleString()} suzu cash today~ 💖`);
        }

        // Show confirmation with button
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        const confirmEmbed = RoyalStyler.createRoyalEmbed({
            title: `🌸 Confirm Gift 🌸`,
            description: `💖 **${message.author.username}**, do you want to give **${amount.toLocaleString()}** suzu cash to **${target.username}**?\n\n🪙 Click "Yes, I Agree" to confirm the transaction~`,
            color: ROYAL_COLORS.PINK,
            thumbnail: message.author.displayAvatarURL({ dynamic: true }),
            footer: { text: `Only you can confirm this transaction | ©Vishal` }
        });

        const confirmButton = new ButtonBuilder()
            .setCustomId(`give_confirm_${message.author.id}_${target.id}_${amount}`)
            .setLabel('Yes, I Agree')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder().addComponents(confirmButton);

        return message.reply({ embeds: [confirmEmbed], components: [row] });
    }
};
