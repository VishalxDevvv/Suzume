const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'github',
    description: 'Get GitHub user information',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a GitHub username! Example: \`$github octocat\``);
        }

        try {
            const username = args[0];
            const response = await fetch(`https://api.github.com/users/${username}`);
            
            if (!response.ok) {
                return message.reply(`${ROYAL_EMOJIS.ERROR} GitHub user "${username}" not found!`);
            }

            const data = await response.json();

            const embed = RoyalStyler.createRoyalEmbed({
                title: `💻 ${data.name || data.login}`,
                description: data.bio || 'No bio available',
                color: ROYAL_COLORS.MIDNIGHT,
                thumbnail: data.avatar_url,
                fields: [
                    { name: 'Username', value: data.login, inline: true },
                    { name: 'Public Repos', value: data.public_repos.toString(), inline: true },
                    { name: 'Followers', value: data.followers.toString(), inline: true },
                    { name: 'Following', value: data.following.toString(), inline: true },
                    { name: 'Location', value: data.location || 'Not specified', inline: true },
                    { name: 'Joined', value: new Date(data.created_at).toLocaleDateString(), inline: true }
                ],
                footer: { text: 'Source: GitHub API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch GitHub data!`);
        }
    }
};
