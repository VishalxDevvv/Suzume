const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('./royalStyles');

class CustomEmojiManager {
    
    // Bot's custom emojis (add your server's custom emojis here)
    static BOT_EMOJIS = {
        HEART: '✨',
        GEM: '<a:gem:1412006973758767174>',
        CASTLE: '<a:castle:1412006452259983422>',
        SWORD: '<a:sword:1412006288640184411>',
        SHIELD: '<a:Shield:1412005769590739004>',
        SCROLL: '<a:scroll:1412005307218919424>',
        CRYSTALS: '<a:crystals:1412004976288337920>',
        SPARKLES: '<a:sparkles:1412004805517381732>',
        STAR: '<a:star:1412004524964581427>',
        DIAMOND: '<a:Diamond:1412004332487835708>',
        LAUGH: '<a:laugh:1412004016103227392>',
        CUTE: '<a:cute:1412003781603754005>',
        ERROR: '<a:ninja_fail_error:1412003583112642590>',
        SUCCESS: '<a:success:1412003378455642134>',
        WELCOME: '<a:Welcome:1412003040395006063>',
        
        // New animated emojis
        HELLO: '<a:hello:1412015673877598319>',
        STATUS_IDLE: '<a:status_idle:1412015368096190515>',
        STATUS_ONLINE: '<a:status_online:1412015257039409184>',
        STATUS_OFFLINE: '<a:status_offline:1412015239742099456>',
        SETTINGS: '<a:settings:1412014909704896603>',
        TOOLS: '<a:tools:1412014731283398656>',
        TAG: '<a:tag:1412014490794463354>',
        USER: '<a:User:141201389435474996>',
        NETWORK: '<a:network:1412013628693020775>',
        PING: '<a:Ping:1412013428121534475>',
        TIME: '<a:time:1412013235837603974>',
        LIBRARY: '<a:Library:1412013054702653461>',
        INFO: '<a:info:1412012918320664646>',
        FIRE: '<a:Fire:1412016237692588122>'
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
