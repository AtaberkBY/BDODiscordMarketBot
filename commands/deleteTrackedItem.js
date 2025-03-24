const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { query } = require('../db.js');

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

        userItems.forEach((item, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_item_${item.item_id}_${item.item_name}`)
                    .setLabel(`${index + 1}. ${item.item_name}`)
                    .setStyle(ButtonStyle.Danger)
            );
        });

        const message = await interaction.editReply({ embeds: [embed], components: [row] });

        const filter = (i) => i.user.id === userId;
        const collector = message.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            const args = i.customId.split('_');
            const action = args[0];
            const itemId = parseInt(args[2], 10);
            const itemName = args.slice(3).join('_');

            if (action === 'delete') {
                const confirmEmbed = new EmbedBuilder()
                    .setTitle('Are you sure?')
                    .setDescription(`Are you sure you want to delete this item?\n\n**Item: ${itemName}**`)
                    .setColor('#FF0000');

                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`confirm_delete_${itemId}_${itemName}`)
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`cancel_delete_${itemId}_${itemName}`)
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger)
                );

                await i.update({ embeds: [confirmEmbed], components: [confirmRow] });
            }

            if (action === 'confirm') {
                await query('DELETE FROM tracked_items WHERE item_id = $1 AND user_id = $2', [itemId, userId]);

                const successEmbed = new EmbedBuilder()
                    .setTitle('Item Deleted')
                    .setDescription(`The item **${itemName}** has been deleted successfully.`)
                    .setColor('#00FF00');

                return await i.update({ embeds: [successEmbed], components: [] });
            }

            if (action === 'cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setTitle('Item Deletion Canceled')
                    .setDescription(`The deletion of the item **${itemName}** has been canceled.`)
                    .setColor('#FF0000');

                return await i.update({ embeds: [cancelEmbed], components: [] });
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] });
        });
    }
};
