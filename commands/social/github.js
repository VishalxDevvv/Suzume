const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'github',
    description: 'Look up GitHub user information',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a GitHub username! Usage: `$github <username>`');
        }

        try {
            const username = args[0];
            const response = await fetch(`https://api.github.com/users/${username}`);
            
            if (!response.ok) {
                return message.reply('GitHub user not found!');
            }

            const user = await response.json();

            const embed = new EmbedBuilder()
                .setTitle(`💻 ${user.name || user.login}`)
                .setDescription(user.bio || 'No bio available')
                .setThumbnail(user.avatar_url)
                .setColor('#24292e')
                .addFields(
                    { name: '👤 Username', value: user.login, inline: true },
                    { name: '${ROYAL_EMOJIS.STATS} Public Repos', value: user.public_repos.toString(), inline: true },
                    { name: '👥 Followers', value: user.followers.toString(), inline: true },
                    { name: '👤 Following', value: user.following.toString(), inline: true },
                    { name: '📅 Joined', value: new Date(user.created_at).toLocaleDateString(), inline: true },
                    { name: '🔗 Profile', value: `[View Profile](${user.html_url})`, inline: true }
                )
                .setFooter({ text: 'GitHub API' })
                .setTimestamp();

            if (user.location) {
                embed.addFields({ name: '📍 Location', value: user.location, inline: true });
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('GitHub API error:', error);
            message.reply('Failed to fetch GitHub user!');
        }
    }
};
