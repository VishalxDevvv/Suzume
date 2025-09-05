const { EmbedBuilder } = require('discord.js');

// Royal color palette
const ROYAL_COLORS = {
    GOLD: 0xFFD700,
    PURPLE: 0x6A0DAD,
    ROYAL_BLUE: 0x4169E1,
    CRIMSON: 0xDC143C,
    EMERALD: 0x50C878,
    SILVER: 0xC0C0C0,
    ROSE_GOLD: 0xE8B4B8,
    MIDNIGHT: 0x191970,
    BURGUNDY: 0x800020
};

// Royal emojis and symbols
const ROYAL_EMOJIS = {
    HEART1: "<:heart1:1412154093215944828>",
    CASH: "<a:cash:1412109414516789380>",
    TAILS: "<:tails:1412096419086598266>",
    HEADS: "<:heads:1412096299788009542>",
    FLIP_COIN: "<a:flip_coin:1412095517185278032>",
    FIRE: "<a:Fire:1412016237692588122>",
    TARGET: "<a:target:1412016076040175666>",
    HELLO: "<a:hello:1412015673877598319>",
    STATUS_IDLE: "<a:status_idle:1412015368096190515>",
    STATUS_ONLINE: "<a:status_online:1412015257039409184>",
    STATUS_OFFLINE: "<a:status_offline:1412015239742099456>",
    SETTINGS: "<a:settings:1412014909704896603>",
    TOOLS: "<a:tools:1412014731283398656>",
    TAG: "<:tag:1412014490794463354>",
    USER: "<:User:1412013899435474996>",
    NETWORK: "<a:network:1412013628693020775>",
    PING: "<a:Ping:1412013428121534475>",
    TIME: "<a:time:1412013235837603974>",
    LIBRARY: "<:Library:1412013054702653461>",
    INFO: "<a:info:1412012918320664646>",
    HEART: "<:heart:1412007203728265239>",
    CASTLE: "<a:castle:1412006452259983422>",
    SWORD: "<a:sword:1412006288640184411>",
    SHIELD: "<a:Shield:1412005769590739004>",
    SCROLL: "<a:scroll:1412005307218919424>",
    CRYSTALS: "<:crystals:1412004976288337920>",
    SPARKLES: "<a:sparkles:1412004805517381732>",
    STAR: "<a:star:1412004524964581427>",
    DIAMOND: "<a:Diamond:1412004332487835708>",
    LAUGH: "<a:laugh:1412004016103227392>",
    CUTE: "<a:cute:1412003781603754005>",
    ERROR: "<a:ninja_fail_error:1412003583112642590>",
    SUCCESS: "<a:success:1412003378455642134>",
    WELCOME: "<a:Welcome:1412003040395006063>",
    CROWN: "👑",
    CRYSTAL: "💎",
    GEM: "💍",
    GOLDEN_HEART: "💛",
    PURPLE_HEART: "💜",
    BOW_DIVIDER: "<:bow_divider:1413228013826478132>",
    BLACK_DIVIDER: "<:black_divider:1413227997208776895>",
    DIVIDE: "<a:divide:1413227844384985139>",
    FANCY_DIVIDER: "<:bow_divider:1413228013826478132><:black_divider:1413227997208776895><a:divide:1413227844384985139>",
    ROCKET: "<a:Fire:1412016237692588122>",
    STATS: "<a:Diamond:1412004332487835708>",
    BULB: "<a:star:1412004524964581427>",
    CATEGORY: "<a:settings:1412014909704896603>",
};

// Royal decorative elements
const DECORATIONS = {
    DIVIDER: '═══════════════════════════════',
    FANCY_DIVIDER: '<:bow_divider:1413228013826478132><:black_divider:1413227997208776895><a:divide:1413227844384985139>',
    ROCKET: "<a:Fire:1412016237692588122>",
    STATS: "<a:Diamond:1412004332487835708>",
    BULB: "<a:star:1412004524964581427>",
    CATEGORY: "<a:settings:1412014909704896603>",
    BORDER_TOP: '╔═══════════════════════════════╗',
    BORDER_BOTTOM: '╚═══════════════════════════════╝',
    BULLET: '◆',
    ARROW: '▸',
    ROYAL_LINE: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'
};

class RoyalStyler {
    
    // Create an enhanced embed with styling
    static createRoyalEmbed(options = {}) {
        const {
            title = '',
            description = '',
            color = ROYAL_COLORS.PURPLE,
            thumbnail = null,
            image = null,
            fields = [],
            footer = null,
            author = null
        } = options;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTimestamp();

        // Enhanced title with styling
        if (title) {
            const styledTitle = `${ROYAL_EMOJIS.CROWN} ${title} ${ROYAL_EMOJIS.CROWN}`;
            embed.setTitle(styledTitle);
        }

        // Enhanced description with decorative elements
        if (description) {
            const styledDescription = `${DECORATIONS.FANCY_DIVIDER}\n${description}\n${DECORATIONS.FANCY_DIVIDER}`;
            embed.setDescription(styledDescription);
        }

        // Add fields with styling
        if (fields.length > 0) {
            fields.forEach(field => {
                const styledName = `${ROYAL_EMOJIS.DIAMOND} ${field.name}`;
                embed.addFields({
                    name: styledName,
                    value: field.value,
                    inline: field.inline || false
                });
            });
        }

        if (thumbnail) embed.setThumbnail(thumbnail);
        if (image) embed.setImage(image);
        if (footer) {
            embed.setFooter({
                text: `${footer.text} | © Vishal`,
                iconURL: footer.iconURL || null
            });
        } else {
            embed.setFooter({
                text: `© Vishal`
            });
        }
        if (author) embed.setAuthor(author);

        return embed;
    }

    // Style help command with enhanced theme
    static createRoyalHelp(prefix) {
        return this.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.CROWN} I'm Suzume🎀 ${ROYAL_EMOJIS.CROWN}`,
            description: `${ROYAL_EMOJIS.FANCY_DIVIDER}\n**${ROYAL_EMOJIS.FIRE} Get Started**\n**Current Prefix:** \`${prefix}\`\n**Change Prefix:** \`${prefix}prefix <new prefix>\` (Admin only)\n\n${ROYAL_EMOJIS.CATEGORY} **Use menu below to view commands**\n${ROYAL_EMOJIS.FANCY_DIVIDER}`,
            color: ROYAL_COLORS.GOLD,
            fields: [
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.DIAMOND} Bot Statistics`,
                    value: `**Total Commands:** 50+ | **Slash Commands:** 49\n**Categories:** 5 | **APIs:** 25+`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.STAR} Featured Commands`,
                    value: `\`${prefix}anime <name>\` - Anime search\n\`${prefix}movie <title>\` - Movie details\n\`${prefix}calc <math>\` - Calculator\n\`${prefix}weather <city>\` - Weather info`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.STAR} Quick Tips`,
                    value: `• Both \`${prefix}\` and \`/\` commands work\n• Commands work in DMs too!\n• Use buttons below for categories\n• Try \`${prefix}invite\` to add me to other servers`,
                    inline: false
                }
            ],
            footer: {
                text: '©Vishal'
            }
        });
    }

    static createApiHelp(prefix) {
        return this.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.FIRE} API Commands ${ROYAL_EMOJIS.FIRE}`,
            description: `${ROYAL_EMOJIS.FANCY_DIVIDER}\nCommands powered by external APIs\n${ROYAL_EMOJIS.FANCY_DIVIDER}`,
            color: ROYAL_COLORS.ROYAL_BLUE,
            fields: [
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.INFO} Information & Lookup`,
                    value: `\`${prefix}weather <city>\` - Weather information\n\`${prefix}country <name>\` - Country details\n\`${prefix}ip <address>\` - IP address lookup\n\`${prefix}define <word>\` - Dictionary definitions\n\`${prefix}news\` - Latest tech news`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.ENTERTAINMENT} Entertainment & Media`,
                    value: `\`${prefix}anime <name>\` - Anime information\n\`${prefix}movie <title>\` - Movie details\n\`${prefix}nasa\` - NASA space picture\n\`${prefix}github <user>\` - GitHub profiles\n\`${prefix}lyrics <song>\` - Song lyrics`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.LAUGH} Fun & Random Content`,
                    value: `\`${prefix}joke\` - Random jokes\n\`${prefix}quote\` - Inspirational quotes\n\`${prefix}fact\` - Random facts\n\`${prefix}advice\` - Life advice\n\`${prefix}meme\` - Random memes\n\`${prefix}pokemon <name>\` - Pokemon info`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.VISUAL} Images & Visual`,
                    value: `\`${prefix}cat\` - Cat images\n\`${prefix}dog\` - Dog images\n\`${prefix}qr <text>\` - QR codes\n\`${prefix}color <hex>\` - Color information\n\`${prefix}avatar [@user]\` - User avatars`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.CRYPTO} Finance & Tools`,
                    value: `\`${prefix}crypto <coin>\` - Cryptocurrency prices\n\`${prefix}translate <text>\` - Auto-translate\n\`${prefix}shorturl <url>\` - URL shortener\n\`${prefix}urban <term>\` - Urban Dictionary\n\`${prefix}recipe\` - Random recipes`,
                    inline: false
                }
            ]
        });
    }

    static createUtilityHelp(prefix) {
        return this.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.DIAMOND} Utility Commands ${ROYAL_EMOJIS.DIAMOND}`,
            description: `${ROYAL_EMOJIS.FANCY_DIVIDER}\nHelpful tools and utilities\n${ROYAL_EMOJIS.FANCY_DIVIDER}`,
            color: ROYAL_COLORS.EMERALD,
            fields: [
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} ${ROYAL_EMOJIS.STAR} Text & Encoding`,
                    value: `\`${prefix}base64 <encode/decode> <text>\` - Base64 encoder/decoder\n\`${prefix}password [length]\` - Generate secure passwords\n\`${prefix}urban <term>\` - Urban Dictionary lookup`,
                    inline: false
                },
                {
                    name: '🧮 Math & Calculation',
                    value: `\`${prefix}calc <expression>\` - Mathematical calculator\n\`${prefix}number [num] [type]\` - Number facts and trivia`,
                    inline: false
                },
                {
                    name: '🔗 Web & URLs',
                    value: `\`${prefix}shorten <url>\` - URL shortener\n\`${prefix}qr <text>\` - Generate QR codes\n\`${prefix}ip <address>\` - IP address lookup`,
                    inline: false
                },
                {
                    name: '🛠️ Server Tools',
                    value: `\`${prefix}purge <amount>\` - Delete messages\n\`${prefix}afk [reason]\` - Set AFK status\n\`${prefix}userinfo [@user]\` - User information\n\`${prefix}avatar [@user]\` - Get user avatar`,
                    inline: false
                }
            ]
        });
    }

    static createAnimeHelp(prefix) {
        return this.createRoyalEmbed({
            title: 'Anime Interactions',
            description: `Cute anime GIF commands for social interactions`,
            color: ROYAL_COLORS.PINK,
            fields: [
                {
                    name: 'Social Actions',
                    value: `🤗 \`${prefix}hug [@user]\`\n😘 \`${prefix}kiss [@user]\`\n🤚 \`${prefix}pat [@user]\`\n🤗 \`${prefix}cuddle [@user]\`\n👉 \`${prefix}poke [@user]\`\n🤭 \`${prefix}tickle [@user]\``,
                    inline: true
                },
                {
                    name: 'More Actions',
                    value: `🍽️ \`${prefix}feed [@user]\`\n😉 \`${prefix}wink [@user]\`\n👋 \`${prefix}wave [@user]\`\n👋 \`${prefix}slap [@user]\`\n👊 \`${prefix}punch [@user]\`\n🦷 \`${prefix}bite [@user]\``,
                    inline: true
                },
                {
                    name: 'Emotions',
                    value: `😭 \`${prefix}cry\`\n😂 \`${prefix}laugh\`\n😏 \`${prefix}smug\`\n💃 \`${prefix}dance\`\n😊 \`${prefix}blush\`\n😴 \`${prefix}sleep\``,
                    inline: false
                }
            ]
        });
    }

    static createModHelp(prefix) {
        return this.createRoyalEmbed({
            title: 'Moderation Commands',
            description: `Commands for server management (requires permissions)`,
            color: ROYAL_COLORS.CRIMSON,
            fields: [
                {
                    name: 'User Management',
                    value: `${ROYAL_EMOJIS.SWORD} \`${prefix}ban @user [reason]\`\n${ROYAL_EMOJIS.SHIELD} \`${prefix}kick @user [reason]\`\n${ROYAL_EMOJIS.CRYSTAL} \`${prefix}timeout @user <time>\`\n${ROYAL_EMOJIS.STAR} \`${prefix}untimeout @user\``,
                    inline: false
                },
                {
                    name: 'Channel Management',
                    value: `🧹 \`${prefix}purge <amount>\` - Delete messages (1-100)\n📝 \`${prefix}setwelcome [#channel]\`\n👋 \`${prefix}setgoodbye [#channel]\``,
                    inline: false
                }
            ]
        });
    }

    static createGamesHelp(prefix) {
        return this.createRoyalEmbed({
            title: `${ROYAL_EMOJIS.ENTERTAINMENT} Games & Fun Commands ${ROYAL_EMOJIS.ENTERTAINMENT}`,
            description: `${ROYAL_EMOJIS.FANCY_DIVIDER}\nInteractive games and entertainment\n${ROYAL_EMOJIS.FANCY_DIVIDER}`,
            color: ROYAL_COLORS.EMERALD,
            fields: [
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} Party Games`,
                    value: `${ROYAL_EMOJIS.STAR} \`${prefix}truth\` - Truth questions\n${ROYAL_EMOJIS.LAUGH} \`${prefix}dare\` - Dare challenges\n${ROYAL_EMOJIS.STAR} \`${prefix}wyr\` - Would you rather\n${ROYAL_EMOJIS.LAUGH} \`${prefix}nhie\` - Never have I ever`,
                    inline: false
                },
                {
                    name: 'Interactive',
                    value: `🧠 \`${prefix}trivia\` - Trivia questions\n🎱 \`${prefix}8ball <question>\` - Magic 8-ball\n💕 \`${prefix}ship @user1 @user2\` - Love compatibility`,
                    inline: false
                },
                {
                    name: 'Level System',
                    value: `${ROYAL_EMOJIS.CROWN} \`${prefix}level [@user]\`\n${ROYAL_EMOJIS.DIAMOND} \`${prefix}leaderboard\`\n${ROYAL_EMOJIS.SPARKLES} \`${prefix}setlevelrole <level> @role\``,
                    inline: false
                }
            ]
        });
    }

    // Style ping command with enhanced theme
    static createRoyalPing(latency, apiLatency) {
        const qualityEmoji = latency < 100 ? ROYAL_EMOJIS.DIAMOND : 
                           latency < 200 ? ROYAL_EMOJIS.STAR : ROYAL_EMOJIS.CRYSTAL;
        
        return this.createRoyalEmbed({
            title: 'Connection Status',
            description: `${qualityEmoji} The messenger has returned!\n\n**Connection Quality:** ${this.getConnectionQuality(latency)}`,
            color: latency < 100 ? ROYAL_COLORS.EMERALD : 
                   latency < 200 ? ROYAL_COLORS.GOLD : ROYAL_COLORS.CRIMSON,
            fields: [
                {
                    name: 'Response Time',
                    value: `${ROYAL_EMOJIS.SPARKLES} ${latency}ms`,
                    inline: true
                },
                {
                    name: 'Network Latency',
                    value: `${ROYAL_EMOJIS.CASTLE} ${apiLatency}ms`,
                    inline: true
                }
            ],
            footer: {
                text: 'Network Diagnostics Complete'
            }
        });
    }

    // Style user info with enhanced theme
    static createRoyalUserInfo(user, member) {
        const userRoles = member ? member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => `${ROYAL_EMOJIS.GEM} ${role.name}`)
            .join('\n') || 'No titles assigned' : 'Not a member of this server';

        return this.createRoyalEmbed({
            title: 'User Profile',
            description: `Presenting the distinguished profile of **${user.tag}**`,
            color: ROYAL_COLORS.ROYAL_BLUE,
            thumbnail: user.displayAvatarURL({ size: 256 }),
            fields: [
                {
                    name: 'Identity',
                    value: `${ROYAL_EMOJIS.SCROLL} **${user.tag}**\n${ROYAL_EMOJIS.DIAMOND} ID: \`${user.id}\``,
                    inline: true
                },
                {
                    name: 'Account Created',
                    value: `${ROYAL_EMOJIS.CASTLE} <t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: true
                },
                {
                    name: 'Roles & Honors',
                    value: userRoles,
                    inline: false
                }
            ],
            footer: {
                text: 'Registry of Distinguished Members'
            }
        });
    }

    // Style level system with enhanced theme
    static createRoyalLevelCard(member, stats) {
        const progressBar = this.createRoyalProgressBar(stats.current_xp, stats.xp_needed);
        const rankEmoji = this.getRankEmoji(stats.level);
        
        return this.createRoyalEmbed({
            title: 'Ranking Certificate',
            description: `Behold the distinguished achievements of **${member.displayName}**`,
            color: ROYAL_COLORS.GOLD,
            thumbnail: member.user.displayAvatarURL({ size: 256 }),
            fields: [
                {
                    name: 'Current Rank',
                    value: `${rankEmoji} **Level ${stats.level}**`,
                    inline: true
                },
                {
                    name: 'Experience Points',
                    value: `${ROYAL_EMOJIS.STAR} **${stats.total_xp.toLocaleString()}** XP`,
                    inline: true
                },
                {
                    name: 'Progress to Next Rank',
                    value: `${progressBar}\n${ROYAL_EMOJIS.SPARKLES} ${stats.current_xp}/${stats.xp_needed} XP`,
                    inline: false
                }
            ],
            footer: {
                text: 'Academy of Distinguished Members'
            }
        });
    }

    // Style 8ball with enhanced theme
    static createRoyal8Ball(question, answer) {
        const answerType = answer.includes('🟢') ? 'favorable' : 
                          answer.includes('🟡') ? 'uncertain' : 'unfavorable';
        
        const color = answerType === 'favorable' ? ROYAL_COLORS.EMERALD :
                     answerType === 'uncertain' ? ROYAL_COLORS.GOLD : ROYAL_COLORS.CRIMSON;

        return this.createRoyalEmbed({
            title: 'Oracle Consultation',
            description: `The mystical crystal ball reveals the wisdom of the ages...`,
            color: color,
            fields: [
                {
                    name: 'Your Inquiry',
                    value: `${ROYAL_EMOJIS.SCROLL} *"${question}"*`,
                    inline: false
                },
                {
                    name: 'Divine Revelation',
                    value: `${ROYAL_EMOJIS.CRYSTAL} **${answer}**`,
                    inline: false
                }
            ],
            footer: {
                text: 'The Oracle Has Spoken | Wisdom of the Ancient Realm'
            }
        });
    }

    // Style ship command with enhanced theme
    static createRoyalShip(person1, person2, percentage, shipName, message) {
        const heartBar = this.createRoyalHeartBar(percentage);
        const compatibilityLevel = this.getCompatibilityLevel(percentage);
        
        const color = percentage >= 80 ? ROYAL_COLORS.ROSE_GOLD :
                     percentage >= 60 ? ROYAL_COLORS.PURPLE :
                     percentage >= 40 ? ROYAL_COLORS.ROYAL_BLUE :
                     percentage >= 20 ? ROYAL_COLORS.SILVER : ROYAL_COLORS.MIDNIGHT;

        return this.createRoyalEmbed({
            title: 'Matchmaking Ceremony',
            description: `${ROYAL_EMOJIS.GOLDEN_HEART} The Court of Love presents an official compatibility reading ${ROYAL_EMOJIS.GOLDEN_HEART}`,
            color: color,
            fields: [
                {
                    name: 'Couple',
                    value: `${ROYAL_EMOJIS.CROWN} **${person1}** ${ROYAL_EMOJIS.PURPLE_HEART} **${person2}** ${ROYAL_EMOJIS.CROWN}`,
                    inline: false
                },
                {
                    name: 'Ship Name',
                    value: `${ROYAL_EMOJIS.GEM} **${shipName}**`,
                    inline: true
                },
                {
                    name: 'Compatibility Rating',
                    value: `${ROYAL_EMOJIS.DIAMOND} **${percentage}%**`,
                    inline: true
                },
                {
                    name: 'Love Meter',
                    value: heartBar,
                    inline: false
                },
                {
                    name: 'Final Decree',
                    value: `${ROYAL_EMOJIS.SCROLL} *${message}*\n\n**Compatibility Level:** ${compatibilityLevel}`,
                    inline: false
                }
            ],
            footer: {
                text: 'Certified by the Court of Love | May Your Hearts Find Harmony'
            }
        });
    }

    // Helper methods
    static getConnectionQuality(latency) {
        if (latency < 100) return `${ROYAL_EMOJIS.DIAMOND} Excellent - Premium Quality`;
        if (latency < 200) return `${ROYAL_EMOJIS.STAR} Good - High Quality`;
        if (latency < 300) return `${ROYAL_EMOJIS.CRYSTAL} Fair - Acceptable`;
        return `${ROYAL_EMOJIS.SCROLL} Poor - Requires Attention`;
    }

    static getRankEmoji(level) {
        if (level >= 50) return ROYAL_EMOJIS.CROWN;
        if (level >= 30) return ROYAL_EMOJIS.DIAMOND;
        if (level >= 20) return ROYAL_EMOJIS.GEM;
        if (level >= 10) return ROYAL_EMOJIS.STAR;
        return ROYAL_EMOJIS.SPARKLES;
    }

    static createRoyalProgressBar(current, needed) {
        const percentage = Math.floor((current / needed) * 100);
        const filledBars = Math.floor(percentage / 10);
        const emptyBars = 10 - filledBars;
        
        const filled = ROYAL_EMOJIS.DIAMOND.repeat(filledBars);
        const empty = '◇'.repeat(emptyBars);
        
        return `${filled}${empty} **${percentage}%**`;
    }

    static createRoyalHeartBar(percentage) {
        const filledHearts = Math.floor(percentage / 10);
        const emptyHearts = 10 - filledHearts;
        
        const filled = ROYAL_EMOJIS.PURPLE_HEART.repeat(filledHearts);
        const empty = '🤍'.repeat(emptyHearts);
        
        return `${filled}${empty} **${percentage}%**`;
    }

    static getCompatibilityLevel(percentage) {
        if (percentage >= 90) return `${ROYAL_EMOJIS.CROWN} **PERFECT SOULMATES**`;
        if (percentage >= 80) return `${ROYAL_EMOJIS.DIAMOND} **EXCELLENT MATCH**`;
        if (percentage >= 70) return `${ROYAL_EMOJIS.GEM} **GREAT ROMANCE**`;
        if (percentage >= 60) return `${ROYAL_EMOJIS.STAR} **PROMISING UNION**`;
        if (percentage >= 50) return `${ROYAL_EMOJIS.SPARKLES} **POTENTIAL BOND**`;
        if (percentage >= 30) return `${ROYAL_EMOJIS.CRYSTAL} **FRIENDLY ACQUAINTANCE**`;
        return `${ROYAL_EMOJIS.SCROLL} **DISTANT RELATIONS**`;
    }

    // Style welcome message with enhanced theme
    static createRoyalWelcome(member) {
        // Your specific custom emojis
        const hello = '<:hello:1410217672834289704>';
        const welcome = '<a:welcome:1410218072320507904>'; // animated
        
        // Fallback emojis from other servers
        const cutu = member.client.emojis.cache.find(e => e.name === 'cutu') || '😊';
        const flex = member.client.emojis.cache.find(e => e.name === 'flex') || '💪';
        
        return this.createRoyalEmbed({
            title: `${welcome} Welcome to the Kingdom!`,
            description: `${ROYAL_EMOJIS.CASTLE} ${hello} A new soul has joined our realm!\n\n**${member.user.username}** welcome to our amazing community! ${welcome}`,
            color: ROYAL_COLORS.GOLD,
            thumbnail: member.user.displayAvatarURL({ size: 256 }),
            fields: [
                {
                    name: `${ROYAL_EMOJIS.CROWN} Royal Welcome`,
                    value: `${hello} Welcome, ${member}, to **${member.guild.name}**!\nYou're going to love it here! ${flex}`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.SCROLL} Getting Started`,
                    value: `${ROYAL_EMOJIS.SCROLL} Use \`$help\` to explore commands ${cutu}\n${ROYAL_EMOJIS.STAR} Chat to earn XP and level up! ${flex}`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} Member Count`,
                    value: `You are the **${member.guild.memberCount}th** member! ${welcome}`,
                    inline: true
                }
            ],
            footer: {
                text: `Welcome to ${member.guild.name} • Have fun!`
            }
        });
    }

    // Style goodbye message with enhanced theme
    static createRoyalGoodbye(member) {
        // Get custom emojis
        const pepecry = member.client.emojis.cache.find(e => e.name === 'pepecry') || '😢';
        const cryy = member.client.emojis.cache.find(e => e.name === 'cryy') || '😭';
        const pray = member.client.emojis.cache.find(e => e.name === 'pray') || '🙏';
        
        return this.createRoyalEmbed({
            title: `${pepecry} Farewell Ceremony`,
            description: `${ROYAL_EMOJIS.CASTLE} With heavy hearts, we bid farewell to a valued member ${cryy}\n\n**${member.user.username}** has left our community... ${pray}`,
            color: ROYAL_COLORS.BURGUNDY,
            thumbnail: member.user.displayAvatarURL({ size: 256 }),
            fields: [
                {
                    name: `${ROYAL_EMOJIS.SCROLL} Departing Member`,
                    value: `${pepecry} **${member.user.tag}** has left the server\nWe'll miss you! ${cryy}`,
                    inline: false
                },
                {
                    name: `${ROYAL_EMOJIS.STAR} Time in Community`,
                    value: `Joined: ${member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown'}`,
                    inline: true
                },
                {
                    name: `${ROYAL_EMOJIS.DIAMOND} Current Size`,
                    value: `**${member.guild.memberCount}** members remain ${pray}`,
                    inline: true
                }
            ],
            footer: {
                text: `Come back anytime! • ID: ${member.user.id}`
            }
        });
    }
}

module.exports = { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS, DECORATIONS };
