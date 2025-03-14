const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");
const { pool } = require("./db"); // Veritabanı işlemleri için db.js dosyasını içe aktar
const { getEnhancementName } = require("./utils");

// !ping komutu
const commands = [
    {
        data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Botun çalışıp çalışmadığını kontrol eder."),
        async execute(interaction) {
            await interaction.reply("🏓 Pong!");
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName("trackeditems")
            .setDescription("Veritabanındaki itemleri gösterir."),
        async execute(interaction) {
            try {
                const result = await pool.query("SELECT * FROM bdo_items");
                if (result.rows.length === 0) {
                    await interaction.reply("📂 Veri tabanında hiç kayıt yok.");
                } else {
                    let response = "📜 **Items Tablosundaki Veriler:**\n";
                    result.rows.forEach((row, index) => {
                        response += `🔹 **${index + 1}.** ${row.item_name}\n`;
                    });
                    await interaction.reply(response);
                }
            } catch (err) {
                console.error("❌ Veri tabanı hatası:", err);
                await interaction.reply("⚠️ Veri tabanı sorgusu sırasında hata oluştu.");
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName("marketqueue")
            .setDescription("Market sırasındaki itemleri gösterir."),
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
    }
];

module.exports = commands;
