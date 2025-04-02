const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { query } = require('../db.js');
const { getEnhancementName } = require('../utils/utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletetrackeditem')
        .setDescription('Deletes a tracked item from the database.'),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const userItems = await query('SELECT * FROM tracked_items WHERE user_id = $1 ORDER BY item_name ASC', [userId]);

        if (userItems.length === 0) {
            return interaction.editReply('📂 There are no tracked items.');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Tracked Items')
            .setDescription('Select the item you want to delete.');

        const row = new ActionRowBuilder();
        const buttons = await Promise.all(
            userItems.map(async (item, index) => {
                let enhancementName = await getEnhancementName(item.enhancement_level, item.main_category, item.item_name);
                return new ButtonBuilder()
                    .setCustomId(`delete_item_${item.item_id}_${enhancementName}_${item.enhancement_level}`)
                    .setLabel(`${index + 1}. ${enhancementName}`)
                    .setStyle(ButtonStyle.Danger);
            })
        );
        row.addComponents(...buttons);
        

        const message = await interaction.editReply({ embeds: [embed], components: [row] });

        const filter = (i) => i.user.id === userId;
        const collector = message.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            const args = i.customId.split('_');
            const action = args[0];
            const itemId = parseInt(args[2], 10);
            const enhancementName = args.slice(3, args.length - 1).join('_');
            const enhancementLevel = parseInt(args[args.length - 1], 10);


            if (action === 'delete') {
                const confirmEmbed = new EmbedBuilder()
                    .setTitle('Are you sure?')
                    .setDescription(`Are you sure you want to delete this item?\n\n**Item: ${enhancementName}**`)
                    .setColor('#FF0000');

                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`confirm_delete_${itemId}_${enhancementName}_${enhancementLevel}`)
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`cancel_delete_${itemId}_${enhancementName}_${enhancementLevel}`)
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger)
                );

                await i.update({ embeds: [confirmEmbed], components: [confirmRow] });
            }

            if (action === 'confirm') {

                await query('DELETE FROM tracked_items WHERE item_id = $1 AND user_id = $2 AND enhancement_level = $3', [itemId, userId, enhancementLevel]);

                const successEmbed = new EmbedBuilder()
                    .setTitle('Item Deleted')
                    .setDescription(`The item **${enhancementName}** has been deleted successfully.`)
                    .setColor('#00FF00');

                return await i.update({ embeds: [successEmbed], components: [] });
            }

            if (action === 'cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setTitle('Item Deletion Canceled')
                    .setDescription(`The deletion of the item **${enhancementName}** has been canceled.`)
                    .setColor('#FF0000');

                return await i.update({ embeds: [cancelEmbed], components: [] });
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });
    }
};
