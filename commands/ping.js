// ./commands/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun çalışıp çalışmadığını kontrol eder.'),
    async execute(interaction) {
        await interaction.reply('🏓 Pong!');
    },
};
