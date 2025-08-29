const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');
const axios = require('axios');

module.exports = {
    name: 'recipe',
    description: 'Get a random recipe',
    execute(message, args) {
        axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
            .then(response => {
                const meal = response.data.meals[0];
                const ingredients = [];
                
                for (let i = 1; i <= 20; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];
                    if (ingredient && ingredient.trim()) {
                        ingredients.push(`${measure} ${ingredient}`);
                    }
                }
                
                const embed = RoyalStyler.createRoyalEmbed({
                    title: `${ROYAL_EMOJIS.LOVE} ${meal.strMeal}`,
                    description: `${ROYAL_EMOJIS.STAR} **Category:** ${meal.strCategory}\n${ROYAL_EMOJIS.DIAMOND} **Origin:** ${meal.strArea}`,
                    color: ROYAL_COLORS.ROSE_GOLD,
                    thumbnail: meal.strMealThumb,
                    fields: [
                        { name: 'Ingredients', value: ingredients.slice(0, 10).join('\n'), inline: true },
                        { name: 'Instructions', value: meal.strInstructions.substring(0, 500) + '...', inline: false }
                    ],
                    url: meal.strYoutube
                });
                message.reply({ embeds: [embed] });
            })
            .catch(error => {
                message.reply(`${ROYAL_EMOJIS.ERROR} Failed to fetch recipe!`);
            });
    }
};
