const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('CRUD işlemleri için menüyü açar.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📌 CRUD İşlemleri Menüsü')
            .setDescription('Aşağıdaki butonları kullanarak CRUD işlemlerini gerçekleştirebilirsiniz.')
            .addFields(
                { name: '🆕 Create', value: 'Yeni bir kayıt eklemek için kullanılır.', inline: true },
                { name: '✏️ Update', value: 'Var olan bir kaydı güncellemek için kullanılır.', inline: true },
                { name: '🗑️ Delete', value: 'Bir kaydı silmek için kullanılır.', inline: true },
                { name: '📋 Read', value: 'Kayıtları görüntülemek için kullanılır.', inline: true }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('crud_create')
                    .setLabel('🆕 Create')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('crud_update')
                    .setLabel('✏️ Update')
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId('crud_delete')
                    .setLabel('🗑️ Delete')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('crud_read')
                    .setLabel('📋 Read')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
