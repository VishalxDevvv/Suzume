const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'reddit',
    description: 'Get a random post from a subreddit',
    usage: 'reddit <subreddit>',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Please provide a subreddit name! Example: `reddit memes`');
        }

        const subreddit = args[0].toLowerCase();
        
        try {
            const response = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`);
            const data = await response.json();
            
            if (!data[0] || !data[0].data.children[0]) {
                return message.reply('Subreddit not found or no posts available!');
            }

            const post = data[0].data.children[0].data;
            
            const embed = new EmbedBuilder()
                .setTitle(post.title.length > 256 ? post.title.substring(0, 253) + '...' : post.title)
                .setURL(`https://reddit.com${post.permalink}`)
                .setDescription(post.selftext ? (post.selftext.length > 2048 ? post.selftext.substring(0, 2045) + '...' : post.selftext) : '')
                .addFields(
                    { name: '👍 Upvotes', value: post.ups.toString(), inline: true },
                    { name: '💬 Comments', value: post.num_comments.toString(), inline: true },
                    { name: '📊 Subreddit', value: `r/${post.subreddit}`, inline: true }
                )
                .setColor('#FF4500')
                .setFooter({ text: `Posted by u/${post.author}` })
                .setTimestamp(new Date(post.created_utc * 1000));

            if (post.url && (post.url.endsWith('.jpg') || post.url.endsWith('.png') || post.url.endsWith('.gif'))) {
                embed.setImage(post.url);
            }

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Reddit API error:', error);
            message.reply('Failed to fetch Reddit post!');
        }
    }
};
