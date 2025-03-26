// ./commands/trackeditems.js
const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../db.js');
const { getEnhancementName } = require('../utils/utils.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackeditems')
        .setDescription('Shows tracked items in the database.'),
    async execute(interaction) {
        try {
            const result = await query(`SELECT * FROM tracked_items where user_id = $1`, [interaction.user.id]);
            if (result.length === 0) {
                await interaction.reply("📂 There are no tracked items.");
            } else {
                let response = "📜 **Tracked Items:**\n";
                result.forEach((row, index) => {
                    response += `🔹 **${index + 1}.** ${getEnhancementName(row.enhancement_level,row.main_category,row.item_name)} -> ${formatNumber(row.target_price)}\n`;
                });
                await interaction.reply(response);
            }
        } catch (err) {
            console.error("❌ Veri tabanı hatası:", err);
            await interaction.reply("⚠️ An error has occoured when getting the items.");
        }
    },
};

function formatNumber(num) {
    if( num >= 1e12) return (num / 1e12).toFixed(3) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
}

