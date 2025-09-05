const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'youtube',
    description: 'Search for YouTube videos',
    usage: 'youtube <search query>',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a search query! Example: `youtube funny cats`');
        }

        const query = args.join(' ');
        
        try {
            // Using YouTube's RSS feed for search (no API key required)
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            const response = await fetch(searchUrl);
            const html = await response.text();
            
            // Extract video ID from the HTML
            const videoMatch = html.match(/"videoId":"([^"]+)"/);
            if (!videoMatch) {
                return message.reply('No videos found for that search query!');
            }

            const videoId = videoMatch[1];
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Extract title
            const titleMatch = html.match(/"title":{"runs":\[{"text":"([^"]+)"/);
            const title = titleMatch ? titleMatch[1] : 'YouTube Video';
            
            const embed = new EmbedBuilder()
                .setTitle(title.length > 256 ? title.substring(0, 253) + '...' : title)
                .setURL(videoUrl)
                .setDescription(`🔍 Search: **${query}**`)
                .setColor('#FF0000')
                .setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
                .setFooter({ text: 'YouTube Search Result' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('YouTube search error:', error);
            message.reply('Failed to search YouTube videos!');
        }
    }
};
