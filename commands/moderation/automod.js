const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure automod settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup basic automod rules'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Toggle automod on/off')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable or disable automod')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'setup') {
            try {
                // Create automod rules
                await interaction.guild.autoModerationRules.create({
                    name: 'Royal Bot - Block Profanity',
                    creatorId: interaction.client.user.id,
                    enabled: true,
                    eventType: 1, // MESSAGE_SEND
                    triggerType: 4, // KEYWORD
                    triggerMetadata: {
                        keywordFilter: ['*fuck*', '*shit*', '*bitch*', '*damn*', '*ass*'],
                        regexPatterns: []
                    },
                    actions: [{
                        type: 1, // BLOCK_MESSAGE
                        metadata: {
                            customMessage: 'This message was blocked by Royal Bot automod.'
                        }
                    }]
                });
                
                const embed = new EmbedBuilder()
                    .setTitle(`${ROYAL_EMOJIS.SUCCESS} Automod Setup Complete`)
                    .setColor(ROYAL_COLORS.EMERALD)
                    .setDescription('✅ Basic profanity filter enabled\n✅ Automatic message blocking active')
                    .setFooter({ text: '© Vishal\'s Royal Bot • Server protected' })
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to setup automod.`, ephemeral: true });
            }
        }
        
        if (subcommand === 'toggle') {
            const enabled = interaction.options.getBoolean('enabled');
            
            try {
                const rules = await interaction.guild.autoModerationRules.fetch();
                const botRules = rules.filter(rule => rule.creatorId === interaction.client.user.id);
                
                for (const rule of botRules.values()) {
                    await rule.edit({ enabled });
                }
                
                const embed = new EmbedBuilder()
                    .setTitle(`${ROYAL_EMOJIS.SHIELD} Automod ${enabled ? 'Enabled' : 'Disabled'}`)
                    .setColor(enabled ? ROYAL_COLORS.EMERALD : ROYAL_COLORS.CRIMSON)
                    .setDescription(`Automod has been ${enabled ? 'enabled' : 'disabled'} for this server.`)
                    .setFooter({ text: '© Vishal\'s Royal Bot • Settings updated' })
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                await interaction.reply({ content: `${ROYAL_EMOJIS.ERROR} Failed to toggle automod.`, ephemeral: true });
            }
        }
    },
};
