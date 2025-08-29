const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('./royalStyles');

class CustomEmojiManager {
    
    // Bot's custom emojis (add your server's custom emojis here)
    static BOT_EMOJIS = {
        CUTE: '<:Cute:1410642536003010741>',
        LAUGH: '<:Laugh:1410637273728286790>',
        LOVE: '<:love:1410636588173492314>',
        WARNING: '<:warning:1410636131049017484>',
        INFO: '<:info:1410635141155524758>',
        LOADING: '<:loading:1410634302789648414>',
        ERROR: '<:error:1410633873104179402>',
        SUCCESS: '<a:success:1410633387751768268>',
        WELCOME: '<a:welcome:1410218072320507904>',
        HELLO: '<:hello:1410217672834289704>'
    };
    
    // Get all custom emojis from a guild
    static getGuildEmojis(guild) {
        const emojis = guild.emojis.cache;
        const emojiList = [];
        
        emojis.forEach(emoji => {
            emojiList.push({
                name: emoji.name,
                id: emoji.id,
                animated: emoji.animated,
                string: emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`,
                url: emoji.url
            });
        });
        
        return emojiList;
    }
    
    // Create embed showing all server emojis
    static createEmojiListEmbed(guild) {
        const emojis = this.getGuildEmojis(guild);
        
        if (emojis.length === 0) {
            return RoyalStyler.createRoyalEmbed({
                title: 'Custom Emojis',
                description: 'This server has no custom emojis yet!',
                color: ROYAL_COLORS.SILVER,
                footer: {
                    text: 'Add some custom emojis to make your server unique!'
                }
            });
        }
        
        // Split emojis into chunks for multiple fields
        const chunks = this.chunkArray(emojis, 10);
        const fields = [];
        
        chunks.forEach((chunk, index) => {
            const emojiStrings = chunk.map(emoji => 
                `${emoji.string} \`:${emoji.name}:\``
            ).join('\n');
            
            fields.push({
                name: `Custom Emojis ${index > 0 ? `(${index + 1})` : ''}`,
                value: emojiStrings,
                inline: false
            });
        });
        
        return RoyalStyler.createRoyalEmbed({
            title: 'Server Custom Emojis',
            description: `${ROYAL_EMOJIS.SPARKLES} Here are all the custom emojis available in **${guild.name}**!`,
            color: ROYAL_COLORS.PURPLE,
            fields: fields,
            footer: {
                text: `Total: ${emojis.length} custom emoji(s) | Use format <:name:id> in bot code`
            }
        });
    }
    
    // Get emoji by name
    static getEmojiByName(guild, emojiName) {
        const emoji = guild.emojis.cache.find(e => e.name.toLowerCase() === emojiName.toLowerCase());
        if (emoji) {
            return emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
        }
        return null;
    }
    
    // Get random emoji from server
    static getRandomEmoji(guild) {
        const emojis = guild.emojis.cache;
        if (emojis.size === 0) return null;
        
        const randomEmoji = emojis.random();
        return randomEmoji.animated ? `<a:${randomEmoji.name}:${randomEmoji.id}>` : `<:${randomEmoji.name}:${randomEmoji.id}>`;
    }
    
    // Helper function to chunk arrays
    static chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    
    // Create emoji info embed
    static createEmojiInfoEmbed(guild, emojiName) {
        const emoji = guild.emojis.cache.find(e => e.name.toLowerCase() === emojiName.toLowerCase());
        
        if (!emoji) {
            return RoyalStyler.createRoyalEmbed({
                title: 'Emoji Not Found',
                description: `${ROYAL_EMOJIS.CRYSTAL} No emoji named "${emojiName}" found in this server!`,
                color: ROYAL_COLORS.CRIMSON,
                footer: {
                    text: 'Use +emojis to see all available emojis'
                }
            });
        }
        
        return RoyalStyler.createRoyalEmbed({
            title: 'Emoji Information',
            description: `${ROYAL_EMOJIS.GEM} Details about the **${emoji.name}** emoji`,
            color: ROYAL_COLORS.ROYAL_BLUE,
            thumbnail: emoji.url,
            fields: [
                {
                    name: 'Name',
                    value: `\`:${emoji.name}:\``,
                    inline: true
                },
                {
                    name: 'ID',
                    value: emoji.id,
                    inline: true
                },
                {
                    name: 'Animated',
                    value: emoji.animated ? 'Yes' : 'No',
                    inline: true
                },
                {
                    name: 'Usage in Code',
                    value: `\`${emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`}\``,
                    inline: false
                },
                {
                    name: 'Created',
                    value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:F>`,
                    inline: true
                }
            ],
            footer: {
                text: 'Copy the usage code to use this emoji in bot messages'
            }
        });
    }
}

module.exports = CustomEmojiManager;
