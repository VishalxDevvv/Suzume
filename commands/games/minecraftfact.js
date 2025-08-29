const { EmbedBuilder } = require('discord.js');
const { RoyalStyler, ROYAL_COLORS, ROYAL_EMOJIS } = require('../../royalStyles');

module.exports = {
    name: 'minecraftfact',
    description: 'Get a random Minecraft fact',
    execute(message, args) {
        const facts = [
            "Minecraft was originally called 'Cave Game' during development",
            "The Creeper was created by accident when Notch mixed up the height and length values",
            "Endermen are based on the Slender Man urban legend",
            "The Ghast sounds were made by C418's cat",
            "Minecraft has sold over 300 million copies worldwide",
            "The world of Minecraft is infinite (technically 60 million blocks from spawn)",
            "Redstone was inspired by electrical circuits",
            "The Nether was originally going to be called 'Hell'",
            "Minecraft's code name during development was 'Project Builder'",
            "The first version of Minecraft was made in just 6 days",
            "Notch added wolves after his dog died",
            "The Ender Dragon is female and her name is Jean",
            "Minecraft blocks are exactly 1 cubic meter",
            "The game has been translated into over 100 languages",
            "Minecraft Earth's circumference would be 7 times larger than Earth's",
            "The rarest ore in Minecraft is Ancient Debris",
            "Minecraft's soundtrack has no lyrics intentionally",
            "The game was inspired by Dwarf Fortress and Dungeon Keeper",
            "Steve's beard was removed and became his shirt",
            "Minecraft generates 1.5 billion blocks every second"
        ];

        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        const embed = RoyalStyler.createRoyalEmbed({
            title: '⛏️ Minecraft Fact',
            description: randomFact,
            color: ROYAL_COLORS.EMERALD,
            thumbnail: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/2/2d/Plains_Grass_Block.png',
            footer: { text: 'Did you know?' }
        });

        message.reply({ embeds: [embed] });
    }
};
