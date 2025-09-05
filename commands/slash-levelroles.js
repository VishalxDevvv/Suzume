const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('../database');

const database = new Database();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelroles')
        .setDescription('Displays all configured level roles for this server.'),
    async execute(interaction) {
        try {
            const levelRoles = await database.getLevelRoles(interaction.guild.id);
            
            if (levelRoles.length === 0) {
                return await interaction.reply({ content: '❌ No level roles have been set up for this server!', ephemeral: true });
            }

            let description = '';
            for (const roleData of levelRoles) {
                const role = interaction.guild.roles.cache.get(roleData.role_id);
                const roleName = role ? role.name : 'Deleted Role';
                description += `**Level ${roleData.level}:** ${role ? role : roleName}\n`;
            }

            const rolesEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📋 Level Roles')
                .setDescription(description)
                .setFooter({ text: `${levelRoles.length} level role(s) configured` })
                .setTimestamp();

            await interaction.reply({ embeds: [rolesEmbed] });
        } catch (error) {
            console.error('Error getting level roles:', error);
            await interaction.reply({ content: '❌ An error occurred while fetching level roles.', ephemeral: true });
        }
    },
};
