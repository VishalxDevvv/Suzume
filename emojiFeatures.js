const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('./royalStyles');

class EmojiFun {
    
    // Cute emoji collections
    static CUTE_EMOJIS = {
        hearts: ['${ROYAL_EMOJIS.HEART}', '${ROYAL_EMOJIS.HEART}', '💗', '💓', '💝', '💘', '💌', '💟', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎'],
        flowers: ['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '💐', '🌼', '🌿', '🍀', '🌱', '🌾'],
        sparkles: ['✨', '${ROYAL_EMOJIS.STAR}', '🌟', '💫', '⚡', '${ROYAL_EMOJIS.SPARKLES}', '💥', '🎆', '🎇', '🌠'],
        cute_faces: ['😊', '😍', '🥰', '😘', '😚', '😙', '🤗', '🤭', '😋', '😌', '😇', '🥺', '😻', '😽', '${ROYAL_EMOJIS.HEART}'],
        animals: ['🐱', '🐶', '🐰', '🐹', '🐼', '🐨', '🐸', '🦄', '🐝', '🦋', '🐛', '🐞'],
        food: ['🍓', '🍑', '🍒', '🍇', '🍉', '🍊', '🍋', '🍌', '🥝', '🍍', '🥥', '🧁', '${ROYAL_EMOJIS.STAR}', '${ROYAL_EMOJIS.STAR}', '🍭', '🍬'],
        nature: ['🌙', '☀️', '${ROYAL_EMOJIS.STAR}', '🌈', '☁️', '⛅', '🌤️', '🌦️', '❄️', '☃️', '🌊', '🏔️']
    };
    
    // Get random emoji from category
    static getRandomEmoji(category = 'all') {
        if (category === 'all') {
            const allCategories = Object.values(this.CUTE_EMOJIS).flat();
            return allCategories[Math.floor(Math.random() * allCategories.length)];
        }
        
        const categoryEmojis = this.CUTE_EMOJIS[category];
        if (!categoryEmojis) return '✨';
        
        return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
    }
    
    // Create emoji rain
    static createEmojiRain(category = 'sparkles', count = 15) {
        const emojis = this.CUTE_EMOJIS[category] || this.CUTE_EMOJIS.sparkles;
        let rain = '';
        
        for (let i = 0; i < count; i++) {
            rain += emojis[Math.floor(Math.random() * emojis.length)] + ' ';
        }
        
        return rain.trim();
    }
    
    // Create emoji categories embed
    static createEmojiCategoriesEmbed() {
        const fields = [];
        
        Object.entries(this.CUTE_EMOJIS).forEach(([category, emojis]) => {
            const preview = emojis.slice(0, 8).join(' ');
            fields.push({
                name: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
                value: preview + (emojis.length > 8 ? '...' : ''),
                inline: true
            });
        });
        
        return RoyalStyler.createRoyalEmbed({
            title: 'Emoji Categories',
            description: `${ROYAL_EMOJIS.SPARKLES} Here are all the cute emoji categories available!`,
            color: ROYAL_COLORS.PURPLE,
            fields: fields,
            footer: {
                text: 'Use +emojirain <category> to create emoji rain!'
            }
        });
    }
    
    // Create emoji rain embed
    static createEmojiRainEmbed(category, count = 15) {
        const rain = this.createEmojiRain(category, count);
        const randomEmoji = this.getRandomEmoji(category);
        
        return RoyalStyler.createRoyalEmbed({
            title: 'Emoji Rain',
            description: `${randomEmoji} **${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Rain!** ${randomEmoji}\n\n${rain}`,
            color: ROYAL_COLORS.ROSE_GOLD,
            footer: {
                text: 'Use +emojicategories to see all available categories'
            }
        });
    }
    
    // Create random emoji embed
    static createRandomEmojiEmbed() {
        const randomEmoji = this.getRandomEmoji();
        const allEmojis = Object.values(this.CUTE_EMOJIS).flat();
        const randomSelection = [];
        
        for (let i = 0; i < 10; i++) {
            randomSelection.push(allEmojis[Math.floor(Math.random() * allEmojis.length)]);
        }
        
        return RoyalStyler.createRoyalEmbed({
            title: 'Random Emoji Magic',
            description: `${ROYAL_EMOJIS.CRYSTAL} Here's your random emoji selection!\n\n**Featured Emoji:** ${randomEmoji}\n\n**Random Collection:**\n${randomSelection.join(' ')}`,
            color: ROYAL_COLORS.GOLD,
            footer: {
                text: 'Each time you use this command, you get different emojis!'
            }
        });
    }
    
    // Create emoji mood embed
    static createEmojiMoodEmbed(mood) {
        const moodEmojis = {
            happy: ['😊', '😄', '😁', '🥰', '😍', '🤗', '😋', '😌', '✨', '🌟', '${ROYAL_EMOJIS.HEART}', '🌈'],
            sad: ['😢', '😭', '😔', '😞', '💔', '🥺', '😿', '🌧️', '☁️', '💙'],
            excited: ['🤩', '😆', '${ROYAL_EMOJIS.SPARKLES}', '${ROYAL_EMOJIS.SPARKLES}', '✨', '${ROYAL_EMOJIS.STAR}', '${ROYAL_EMOJIS.SPARKLES}', '💥', '${ROYAL_EMOJIS.ROCKET}', '🎆'],
            love: ['${ROYAL_EMOJIS.HEART}', '${ROYAL_EMOJIS.HEART}', '💗', '💓', '💘', '💝', '😍', '🥰', '😘', '💋', '🌹', '💐'],
            sleepy: ['😴', '😪', '🥱', '😌', '🌙', '${ROYAL_EMOJIS.STAR}', '☁️', '💤', '🛏️'],
            angry: ['😠', '😡', '🤬', '👿', '💢', '${ROYAL_EMOJIS.SPARKLES}', '⚡', '💥', '🌋'],
            cool: ['😎', '🆒', '✨', '${ROYAL_EMOJIS.STAR}', '${ROYAL_EMOJIS.SPARKLES}', '💎', '👑', '🌟', '💫']
        };
        
        const emojis = moodEmojis[mood.toLowerCase()] || moodEmojis.happy;
        const emojiString = emojis.join(' ');
        
        return RoyalStyler.createRoyalEmbed({
            title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Mood`,
            description: `${ROYAL_EMOJIS.SPARKLES} Feeling ${mood}? Here are some perfect emojis for your mood!\n\n${emojiString}`,
            color: ROYAL_COLORS.PURPLE,
            footer: {
                text: 'Available moods: happy, sad, excited, love, sleepy, angry, cool'
            }
        });
    }
}

module.exports = EmojiFun;
