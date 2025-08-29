const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const ServerConfig = require('../../serverConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure server settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('welcome')
                .setDescription('Setup welcome system')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Welcome channel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Welcome message (use {user} and {server})')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('goodbye')
                .setDescription('Setup goodbye system')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Goodbye channel')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Goodbye message (use {user} and {server})')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('levels')
                .setDescription('Setup level system')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Level up channel')
                        .addChannelTypes(ChannelType.GuildText))
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable/disable levels'))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Level up message (use {user} and {level})')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current server settings'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        
        if (subcommand === 'welcome') {
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message') || 'Welcome {user} to {server}!';
            
            ServerConfig.setWelcomeChannel(guildId, channel.id);
            ServerConfig.setWelcomeMessage(guildId, message);
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.SUCCESS} Welcome System Configured`)
                .setColor(ROYAL_COLORS.EMERALD)
                .addFields(
                    { name: '📺 Channel', value: channel.toString(), inline: true },
                    { name: '💬 Message', value: message, inline: false }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Welcome system ready' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        }
        
        else if (subcommand === 'goodbye') {
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message') || 'Goodbye {user}!';
            
            ServerConfig.setGoodbyeChannel(guildId, channel.id);
            ServerConfig.setGoodbyeMessage(guildId, message);
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.SUCCESS} Goodbye System Configured`)
                .setColor(ROYAL_COLORS.BURGUNDY)
                .addFields(
                    { name: '📺 Channel', value: channel.toString(), inline: true },
                    { name: '💬 Message', value: message, inline: false }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Goodbye system ready' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        }
        
        else if (subcommand === 'levels') {
            const channel = interaction.options.getChannel('channel');
            const enabled = interaction.options.getBoolean('enabled');
            const message = interaction.options.getString('message');
            
            if (channel) ServerConfig.setLevelChannel(guildId, channel.id);
            if (enabled !== null) ServerConfig.toggleLevels(guildId, enabled);
            if (message) ServerConfig.setLevelMessage(guildId, message);
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.XP} Level System Configured`)
                .setColor(ROYAL_COLORS.GOLD)
                .addFields(
                    { name: '📺 Channel', value: channel ? channel.toString() : 'Not changed', inline: true },
                    { name: '⚡ Status', value: enabled !== null ? (enabled ? 'Enabled' : 'Disabled') : 'Not changed', inline: true },
                    { name: '💬 Message', value: message || 'Not changed', inline: false }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Level system updated' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        }
        
        else if (subcommand === 'view') {
            const settings = ServerConfig.getSettings(guildId);
            
            const embed = new EmbedBuilder()
                .setTitle(`${ROYAL_EMOJIS.STATS} Server Configuration`)
                .setColor(ROYAL_COLORS.ROYAL_BLUE)
                .addFields(
                    { name: '👋 Welcome Channel', value: settings.welcome_channel ? `<#${settings.welcome_channel}>` : 'Not set', inline: true },
                    { name: '👋 Welcome Message', value: settings.welcome_message || 'Default', inline: false },
                    { name: '👋 Goodbye Channel', value: settings.goodbye_channel ? `<#${settings.goodbye_channel}>` : 'Not set', inline: true },
                    { name: '👋 Goodbye Message', value: settings.goodbye_message || 'Default', inline: false },
                    { name: '🏆 Level Channel', value: settings.level_channel ? `<#${settings.level_channel}>` : 'Current channel', inline: true },
                    { name: '🏆 Levels Enabled', value: settings.level_enabled ? 'Yes' : 'No', inline: true },
                    { name: '🏆 Level Message', value: settings.level_message || 'Default', inline: false }
                )
                .setFooter({ text: '© Vishal\'s Royal Bot • Current settings' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        }
    },
};
