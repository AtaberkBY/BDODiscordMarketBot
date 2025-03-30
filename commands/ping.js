// ./commands/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('For test purposes, to check if bot is online or not.'),
    async execute(interaction) {
        await interaction.reply('🏓 Pong!');
    },
};
