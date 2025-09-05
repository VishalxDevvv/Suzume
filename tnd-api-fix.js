// Fixed TND Button Handler with API - Add this inside your interactionCreate event

if (interaction.isButton() && interaction.customId.startsWith('tnd_')) {
    const type = interaction.customId.split('_')[1];
    let apiUrl;
    
    switch(type) {
        case 'truth':
            apiUrl = 'https://api.truthordarebot.xyz/v1/truth';
            break;
        case 'dare':
            apiUrl = 'https://api.truthordarebot.xyz/api/dare';
            break;
        case 'random':
            const randomType = Math.random() < 0.5 ? 'truth' : 'dare';
            apiUrl = `https://api.truthordarebot.xyz/api/${randomType}`;
            break;
    }
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Ensure all required fields are strings with fallbacks
        const question = String(data.question || 'No question available');
        const questionType = String(data.type || type.toUpperCase());
        const rating = String(data.rating || 'PG13');
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Fixed embed - all fields guaranteed to be valid strings
        const embed = new EmbedBuilder()
            .setTitle(`Requested by ${interaction.user.username}`)
            .setDescription(question)
            .setColor(questionType === 'TRUTH' ? 0x4CAF50 : 0xF44336)
            .setFooter({ text: `Type: ${questionType} | Rating: ${rating} | ID: ${randomId}` })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tnd_truth')
                    .setLabel('Truth')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🤔'),
                new ButtonBuilder()
                    .setCustomId('tnd_dare')
                    .setLabel('Dare')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('😈'),
                new ButtonBuilder()
                    .setCustomId('tnd_random')
                    .setLabel('Random')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎲')
            );
        
        await interaction.update({ embeds: [embed], components: [row] });
        
    } catch (error) {
        console.error('TND API Error:', error);
        await interaction.reply({ 
            content: '❌ Failed to fetch new question!', 
            flags: 64  // Fixed: Use flags instead of ephemeral: true
        });
    }
}

// Also replace all instances of ephemeral: true with flags: 64 in your bot
