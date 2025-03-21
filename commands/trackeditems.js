// ./commands/trackeditems.js
const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../db.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackeditems')
        .setDescription('Shows tracked items in the database.'),
    async execute(interaction) {
        try {
            const result = await query(`SELECT * FROM tracked_items where user_id = $1`, [interaction.user.id]);
            if (result.rows.length === 0) {
                await interaction.reply("📂 There are no tracked items.");
            } else {
                let response = "📜 **Tracked Items:**\n";
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
