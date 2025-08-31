const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'breach',
    description: 'Check if email was in data breaches',
    async execute(message, args) {
        const email = args[0];
        
        if (!email || !email.includes('@')) {
            return message.reply('⚠️ Usage: `+breach <email>`');
        }

        try {
            const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
                headers: { 'User-Agent': 'Discord-Bot' }
            });

            if (response.status === 404) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Security Status: CLEAN')
                    .setDescription(`Email \`${email}\` was not found in any known data breaches`)
                    .setColor('#00FF00')
                    .setFooter({ text: 'Stay vigilant and use strong passwords' })
                    .setTimestamp();
                
                return message.reply({ embeds: [embed] });
            }

            const breaches = await response.json();
            
            const embed = new EmbedBuilder()
                .setTitle('Security Alert: COMPROMISED')
                .setDescription(`Email found in **${breaches.length}** data breach(es)`)
                .addFields(
                    { name: 'Recent Breaches', value: breaches.slice(0, 5).map(b => `• ${b.Name} (${b.BreachDate})`).join('\n') || 'None', inline: false }
                )
                .setColor('#FF0000')
                .setFooter({ text: 'Change passwords immediately' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to check breach status');
        }
    }
};
