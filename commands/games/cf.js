const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const Economy = require('../../economy');

const cooldowns = new Map();

module.exports = {
    name: 'cf',
    aliases: ['flip'],
    description: 'Animated coin flip with betting - $cf <amount> <h/t> or $cf all',
    async execute(message, args) {
        const userId = message.author.id;
        const now = Date.now();
        const cooldownAmount = 3000; // 3 seconds

        // Check cooldown
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`🪙 Chill! Wait ${timeLeft.toFixed(1)}s before flipping again~ ✨`);
            }
        }

        const user = Economy.getUser(userId);
        let betAmount = 0;
        let prediction = null;

        // Parse arguments
        if (args.length >= 1) {
            if (args[0].toLowerCase() === 'all') {
                betAmount = Math.min(user.balance, 250000);
            } else {
                betAmount = parseInt(args[0]);
            }
            
            if (args[1]) {
                const pred = args[1].toLowerCase();
                if (pred === 'h' || pred === 'heads') prediction = 'heads';
                if (pred === 't' || pred === 'tails') prediction = 'tails';
            }
        }

        // Validation
        if (betAmount > 0) {
            if (betAmount > user.balance) {
                return message.reply(`💸 You only have **${user.balance.toLocaleString()}** suzu cash! Can't bet what you don't have~ 😏`);
            }
            if (betAmount > 250000) {
                return message.reply(`🚫 Max bet is **250,000** suzu cash! Don't get too crazy~ 💖`);
            }
            if (betAmount < 1) {
                return message.reply(`🪙 Minimum bet is **1** suzu cash! Don't be cheap~ ✨`);
            }
        }

        cooldowns.set(userId, now);

        // Animation with your custom emoji
        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.HEART} Suzume's Coin Flip ${ROYAL_EMOJIS.HEART}`,
            description: `<a:flip_coin:1412095517185278032> **Flipping...**${betAmount > 0 ? `\n💰 Bet: **${betAmount.toLocaleString()}** suzu cash` : ''}${prediction ? `\n🎯 Prediction: **${prediction}**` : ''}`,
            color: ROYAL_COLORS.GOLD,
            footer: { text: 'The coin spins through the air...' }
        });

        const msg = await message.reply({ embeds: [embed] });

        // Final result after 3 seconds
        setTimeout(async () => {
            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const resultEmoji = result === 'heads' ? '✨' : '✨';
            const resultText = result === 'heads' ? 'Heads' : 'Tails';
            
            let description = `${resultEmoji} **${resultText}!**`;
            let color = result === 'heads' ? ROYAL_COLORS.GOLD : ROYAL_COLORS.SILVER;
            
            // Handle betting
            if (betAmount > 0) {
                const won = !prediction || prediction === result;
                
                if (won) {
                    const winAmount = prediction ? betAmount * 2 : betAmount;
                    Economy.updateBalance(userId, winAmount);
                    Economy.addWin(userId, winAmount);
                    
                    description += `\n\n💖 **You won ${winAmount.toLocaleString()} suzu cash!**`;
                    color = ROYAL_COLORS.GREEN;
                } else {
                    Economy.updateBalance(userId, -betAmount);
                    Economy.addLoss(userId, betAmount);
                    
                    description += `\n\n💸 **You lost ${betAmount.toLocaleString()} suzu cash...**`;
                    color = ROYAL_COLORS.RED;
                }
            }
            
            const finalEmbed = RoyalStyler.createRoyalEmbed({
                title: `${ROYAL_EMOJIS.HEART} Coin Flip Result ${ROYAL_EMOJIS.HEART}`,
                description,
                color,
                footer: { text: `Flipped by ${message.author.username}` }
            });

            await msg.edit({ embeds: [finalEmbed] });
        }, 3000);

        setTimeout(() => cooldowns.delete(userId), cooldownAmount);
    }
};
