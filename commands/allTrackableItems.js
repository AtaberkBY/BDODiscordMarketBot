// ./commands/trackeditems.js
const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../db.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('alltrackableitems')
        .setDescription('Shows all trackable items in the database.')
        .addStringOption(option =>
            option.setName('item-category')
                .setDescription('(OPTIONAL) Specify the category of the item.')
                .addChoices(
                    { name: 'Main Weapons', value: '1' },
                    { name: 'Sub Weapons', value: '5' },
                    { name: 'Awakening Weapons', value: '10' },
                    { name: 'Armors', value: '15' },
                    { name: 'Accessories', value: '20' },
                    { name: 'Life Tools', value: '40' },
                    { name: 'Crystals', value: '50' },
                    { name: 'Ship', value: '70' }
                )
        ),

    async execute(interaction) {
        try {
            console.log(interaction.options.getString('item-category'));
            const categoryId = Number(interaction.options.getString('item-category'));
            let queryText = 'SELECT * FROM items ORDER BY item_name ASC';
            if (categoryId) {
                queryText = `SELECT * FROM items WHERE main_category = '${categoryId}' ORDER BY item_name ASC`;
            }
            const result = await query(queryText);
            if (result.length === 0) {
                await interaction.reply("📂 There are no tracked items.");
            } else {
                let response = "📜 **Trackable Items:**\n";
                result.forEach((row, index) => {
                    response += `🔹 **${index + 1}.** ${row.item_name}\n`;
                });
                await interaction.reply(response);
            }

        } catch (err) {
            console.error("❌ Veri tabanı hatası:", err);
            await interaction.reply("⚠️ An error has occoured when getting the items.");
        }
    },
};
