// ./commands/marketqueue.js
const axios = require('axios');
const { getEnhancementName } = require("../utils");
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('marketqueue')
        .setDescription('Market sırasındaki itemleri gösterir.'),
    async execute(interaction) {
        try {
            const response = await axios.get(`${LIST_BASE_URL}/queue?region=${REGION}&lang=en-US`);
            const queueData = response.data.data;
            if (queueData.length > 0) {
                let responseText = `📜 Market Sırası için listelenen itemler:\n`;
                queueData.forEach((item, index) => {
                    responseText += `🔹 **${index + 1}.** ${getEnhancementName(item.enhancement, item.mainCategory)} ${item.name} - Fiyat: ${item.basePrice.toLocaleString("tr-TR")} - Bitiş: ${new Date(item.endTime).toLocaleString("tr-TR", {timeZone: "Europe/Istanbul"})}\n`;
                });
                await interaction.reply(responseText);
            } else {
                await interaction.reply("🔍 Market sırasında ürün bulunamadı!");
            }
        } catch (error) {
            console.error("⚠️ API HATASI:", error.response ? error.response.data : error.message);
            await interaction.reply("⚠️ API'den veri alınırken hata oluştu.");
        }
    },
};
