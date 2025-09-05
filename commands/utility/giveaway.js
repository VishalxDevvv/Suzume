const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

const activeGiveaways = new Map();

module.exports = {
    name: 'giveaway',
    description: 'Start a giveaway or view participants',
    async execute(message, args) {
        if (args[0] === 'participants') {
            return await showParticipants(message);
        }

        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply(`${ROYAL_EMOJIS.ERROR} You need Manage Server permission!`);
        }

        if (args.length < 2) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Usage: \`$giveaway <duration> <prize>\` or \`$giveaway participants\``);
        }

        const duration = args[0];
        const prize = args.slice(1).join(' ');
        
        const timeMs = parseDuration(duration);
        if (!timeMs) {
            return message.reply(`${ROYAL_EMOJIS.ERROR} Invalid duration! Use: 1h, 30m, 1d`);
        }

        const embed = RoyalStyler.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.GEM} GIVEAWAY!`,
            description: `**Prize:** ${prize}\n**Duration:** ${duration}\n**Winners:** 1\n**Participants:** 0\n\nClick to enter!`,
            color: ROYAL_COLORS.GOLD,
            footer: { text: `Ends` },
            timestamp: new Date(Date.now() + timeMs)
        });

        const enterButton = new ButtonBuilder()
            .setCustomId('giveaway_enter')
            .setLabel('Enter')
            .setEmoji('🎉')
            .setStyle(ButtonStyle.Success);

        const viewButton = new ButtonBuilder()
            .setCustomId('giveaway_participants')
            .setLabel('Participants')
            .setEmoji('👥')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(enterButton, viewButton);
        
        const giveawayMsg = await message.channel.send({ embeds: [embed], components: [row] });
        
        activeGiveaways.set(giveawayMsg.id, {
            prize,
            endTime: Date.now() + timeMs,
            participants: new Set(),
            channelId: message.channel.id,
            messageId: giveawayMsg.id
        });

        setTimeout(() => endGiveaway(giveawayMsg.id, message.client), timeMs);
        message.delete().catch(() => {});
    }
};

async function showParticipants(message) {
    let giveaway;
    for (const [id, g] of activeGiveaways) {
        if (g.channelId === message.channel.id) {
            giveaway = g;
            break;
        }
    }

    if (!giveaway) {
        return message.reply(`${ROYAL_EMOJIS.ERROR} No active giveaway found!`);
    }

    const participants = Array.from(giveaway.participants);
    let participantList = '';
    
    if (participants.length === 0) {
        participantList = 'No participants yet!';
    } else {
        for (let i = 0; i < Math.min(participants.length, 10); i++) {
            try {
                const user = await message.client.users.fetch(participants[i]);
                participantList += `@${user.username} (1 entry)\n`;
            } catch (error) {
                participantList += `Unknown User (1 entry)\n`;
            }
        }
    }

    const embed = RoyalStyler.createRoyalEmbed({
        title: `${ROYAL_EMOJIS.GEM} Giveaway Participants`,
        description: `Prize: **${giveaway.prize}**\n\n${participantList}\n**Total Participants:** ${participants.length}`,
        color: ROYAL_COLORS.ROYAL_BLUE,
        footer: { text: 'Anyone can view this' }
    });

    message.reply({ embeds: [embed] });
}

function parseDuration(duration) {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * multipliers[unit];
}

async function endGiveaway(messageId, client) {
    const giveaway = activeGiveaways.get(messageId);
    if (!giveaway) return;

    const channel = client.channels.cache.get(giveaway.channelId);
    if (!channel) return;

    const participants = Array.from(giveaway.participants);
    let winner = null;
    if (participants.length > 0) {
        winner = participants[Math.floor(Math.random() * participants.length)];
    }

    const embed = RoyalStyler.createRoyalEmbed({
        title: `${ROYAL_EMOJIS.CROWN} Giveaway Ended!`,
        description: `**Prize:** ${giveaway.prize}\n**Winner:** ${winner ? `<@${winner}>` : 'No participants'}\n**Participants:** ${participants.length}`,
        color: winner ? ROYAL_COLORS.GREEN : ROYAL_COLORS.RED
    });

    await channel.send({ embeds: [embed] });
    activeGiveaways.delete(messageId);
}

module.exports.activeGiveaways = activeGiveaways;
