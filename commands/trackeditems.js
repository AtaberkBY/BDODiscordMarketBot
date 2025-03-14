// ./commands/trackeditems.js
const { pool } = require("../db");
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackeditems')
        .setDescription('Veritabanındaki itemleri gösterir.'),
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
};
