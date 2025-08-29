const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'weather',
    description: 'Get weather information',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply(`${ROYAL_EMOJIS.INFO} Please provide a city name! Example: \`$weather London\``);
        }

        try {
            const city = args.join(' ');
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=DEMO_KEY&units=metric`);
            
            if (!response.ok) {
                return message.reply(`${ROYAL_EMOJIS.ERROR} City "${city}" not found!`);
            }

            const data = await response.json();
            const temp = Math.round(data.main.temp);
            const feelsLike = Math.round(data.main.feels_like);

            const embed = RoyalStyler.createRoyalEmbed({
                title: `🌤️ Weather in ${data.name}, ${data.sys.country}`,
                description: `**${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}**`,
                color: ROYAL_COLORS.ROYAL_BLUE,
                fields: [
                    { name: 'Temperature', value: `${temp}°C`, inline: true },
                    { name: 'Feels Like', value: `${feelsLike}°C`, inline: true },
                    { name: 'Humidity', value: `${data.main.humidity}%`, inline: true },
                    { name: 'Wind Speed', value: `${data.wind.speed} m/s`, inline: true },
                    { name: 'Pressure', value: `${data.main.pressure} hPa`, inline: true },
                    { name: 'Visibility', value: `${(data.visibility / 1000).toFixed(1)} km`, inline: true }
                ],
                footer: { text: 'Source: OpenWeatherMap API' }
            });

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch weather data!`);
        }
    }
};
