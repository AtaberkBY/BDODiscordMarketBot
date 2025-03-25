// ./commands/trackeditems.js
const { SlashCommandBuilder } = require('discord.js');
const { query } = require('../db.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackitem')
        .setDescription('Adds wanted item to the database.')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('Full item name without enhancement level required. Ex: Blackstar Crescent Pendulum.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('price')
                .setDescription('Item price. Ex: 30B, 24.8B')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('enhancement_level')
                .setDescription('Item enhancement level')
                .setRequired(true)
                .addChoices(
                    { name: 'Base', value: 0 },
                    { name: 'PRI (I)', value: 1 },
                    { name: 'DUO (II)', value: 2 },
                    { name: 'TRI (III)', value: 3 },
                    { name: 'TET (IV)', value: 4 },
                    { name: 'PEN (V)', value: 5 },
                    { name: 'HEX (VI)', value: 6 },
                    { name: 'SEP (VII)', value: 7 },
                    { name: 'OCT (VIII)', value: 8 },
                    { name: 'NOV (IX)', value: 9 },
                    { name: 'DEC (X)', value: 10 }       
                )),

    async execute(interaction) {
        try {
            const user = interaction.user.id;
            const billion = 1_000_000_000;
            const fallenGods = ["Labreska's Helmet", "Fallen God's Armor", "Ator's Shoes", "Dahn's Gloves"];
            const fallenGodEnhancementNames = {1:"Desperate",2:"Distorted",3:"Silent",4:"Wailing",5:"Obliterating"}

            let itemName = interaction.options.getString('item');
            const priceString = interaction.options.getString('price').toUpperCase();
            const price = priceString.split('B')[0] * billion;
            let enhancementLevel = interaction.options.getInteger('enhancement_level');
            if(!itemName.includes("Preonne") && enhancementLevel > 5){
                await interaction.reply("⚠️ Enhancement level can't be higher than 5 for non Preonne items.");
                return;
            }
            if(!fallenGods.some(item => itemName.includes(item)) && enhancementLevel != 0){
                enhancementLevel+=15;
            }
            
            const userTrackedItemIds = await query('SELECT item_id FROM tracked_items WHERE user_id = $1', [user]);
            const queryText = await query ('SELECT * FROM items WHERE item_name = $1', [itemName]);
            if (queryText.length === 0) {
                const errorRecommendationText = await query('SELECT * FROM items WHERE item_name ILIKE $1', [`%${itemName}%`]);
                await interaction.reply(`⚠️ Item not found. Did you mean?\n ${errorRecommendationText.map(item => item.item_name).join('\n')}`); 
                return;
            }
            if(fallenGods.includes(itemName)){
                itemName = `${fallenGodEnhancementNames[enhancementLevel]} ${itemName}` 
            }

            if (userTrackedItemIds.some(item => Number(item.item_id) === queryText[0]?.item_id)) {
                await interaction.reply("⚠️ Item is already tracked.");
                return;
            }

            await query('INSERT INTO tracked_items (item_id , item_name, main_category , enhancement_level, user_id, target_price) VALUES ($1, $2, $3, $4, $5, $6)', [queryText[0].item_id, itemName, queryText[0].main_category, enhancementLevel, user, price]);
            return interaction.reply("✅ Item added to the database.");

        } catch (err) {
            console.error("❌ Veri tabanı hatası:", err);
            await interaction.reply("⚠️ An error has occoured when getting the items.");
        }
    },
};
