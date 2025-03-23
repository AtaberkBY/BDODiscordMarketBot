const { query } = require('../db'); // Veritabanı bağlantısı
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        console.log(`📌 Butona basıldı: ${interaction.customId}`);

        const user = interaction.user;
        const oldEmbed = interaction.message.embeds[0];
        let newDescription = oldEmbed?.description || '';
        let footerText = '';
        let newFields = [];
        let row_Back;
        let row_Create;
        let row_Armor;

        try {
            if (interaction.customId.startsWith('crud_')) {
                switch (interaction.customId) {
                    case 'crud_create':
                        newDescription = '✅ **Track Item** Please select the category of the item you want to track.';
                        footerText = 'Select below';
                        newFields = [
                            { name: 'Armor', value: 'Helmet/Armor/Gloves/Shoes', inline: true },
                            { name: 'Weapon', value: 'Mainhand/Offhand/Awakening', inline: true },
                            { name: 'Accessories', value: 'Earring/Ring/Belt/Necklace', inline: true },
                        ];

                        row_Create = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('create_category_selection_armor')
                                    .setLabel('Armor')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('create_category_selection_weapon')
                                    .setLabel('Weapon')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('create_category_selection_accessories')
                                    .setLabel('Accessories')
                                    .setStyle(ButtonStyle.Primary)
                            );
                        break;
                    case 'crud_update':
                        newDescription = '✏️ **Update işlemi seçildi!** Var olan bir kaydı güncelleyebilirsiniz.';
                        footerText = 'Lütfen güncellemek istediğiniz kaydı seçin.';
                        break;
                    case 'crud_delete':
                        newDescription = '🗑️ **Delete işlemi seçildi!** Bir kaydı silebilirsiniz.';
                        footerText = 'Lütfen silmek istediğiniz kaydı onaylayın.';
                        break;
                    case 'crud_read':
                        newDescription = '📋 **Read işlemi seçildi!** Kayıtları görüntüleyebilirsiniz.';
                        footerText = 'Mevcut kayıtları görmek için aşağıya bakın.';
                        break;
                    default:
                        newDescription = '❌ Geçersiz işlem!';
                        footerText = 'Bir hata oluştu.';
                }

                const updatedEmbed = EmbedBuilder.from(oldEmbed)
                    .setDescription(newDescription)
                    .setFooter({ text: footerText })
                    .setFields(newFields);

                row_Back = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('back_to_main')
                            .setLabel('↩️ Geri')
                            .setStyle(ButtonStyle.Danger)
                    );

                const components = row_Create ? [row_Create, row_Back] : [row_Back];
                return await interaction.update({ embeds: [updatedEmbed], components });
            }

            if(interaction.customId.startsWith('create_category_selection_')) {
                const category = interaction.customId.split('_')[3];
                switch (category) {
                    case 'armor':
                        newDescription = '✅ **Armor Category Selected!** Choose your armor type.',
                        footerText = 'Please select your armor type.',
                        newFields = [
                            { name: 'Helmet', value: 'Helmet', inline: true },
                            { name: 'Armor', value: 'Armor', inline: true },
                            { name: 'Gloves', value: 'Gloves', inline: true },
                            { name: 'Shoes', value: 'Shoes', inline: true },
                        ]

                        row_Armor = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('armor_helmet')
                                    .setLabel('Helmet')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('armor_armor')
                                    .setLabel('Armor')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('armor_gloves')
                                    .setLabel('Gloves')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('armor_shoes')
                                    .setLabel('Shoes')
                                    .setStyle(ButtonStyle.Primary)
                            );
                        break;
                    case 'weapon':
                        newDescription = '✅ **Weapon Category Selected!** Choose your weapon type.',
                        footerText = 'Please select your weapon type.',
                        newFields = [
                            { name: 'Mainhand', value: 'Mainhand', inline: true },
                            { name: 'Offhand', value: 'Offhand', inline: true },
                            { name: 'Awakening', value: 'Awakening', inline: true },
                        ]

                        row_Weapon = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('weapon_mainhand')
                                    .setLabel('Mainhand')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('weapon_offhand')
                                    .setLabel('Offhand')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('weapon_awakening')
                                    .setLabel('Awakening')                                    
                                    .setStyle(ButtonStyle.Primary)
                            );
                        break;
                    case 'accessories':
                        newDescription = '✅ **Accessories Category Selected!** Choose your accessories type.',
                        footerText = 'Please select your accessories type.',
                        newFields = [
                            { name: 'Ring', value: 'Ring', inline: true },
                            { name: 'Necklace', value: 'Necklace', inline: true },
                            { name: 'Earrings', value: 'Earrings', inline: true },
                            { name: 'Belt', value: 'Belt', inline: true },
                        ]

                        row_Accessories = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('accessories_ring')
                                    .setLabel('Ring')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('accessories_necklace')
                                    .setLabel('Necklace')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder() 
                                    .setCustomId('accessories_earrings')
                                    .setLabel('Earrings')
                                    .setStyle(ButtonStyle.Primary),

                                new ButtonBuilder()
                                    .setCustomId('accessories_belt')
                                    .setLabel('Belt')
                                    .setStyle(ButtonStyle.Primary)
                            );
                        break;
                    default:
                        break;
                }

                const updatedEmbed = EmbedBuilder.from(oldEmbed)
                    .setDescription(newDescription)
                    .setFooter({ text: footerText })
                    .setFields(newFields);

                const components = category === 'armor' ? [row_Armor] : category === 'weapon' ? [row_Weapon] : category === 'accessories' ? [row_Accessories] : [];
                return await interaction.update({ embeds: [updatedEmbed], components });
            }

            if (interaction.customId === 'back_to_main') {
                const mainEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('📌 CRUD İşlemleri Menüsü')
                    .setDescription('Aşağıdaki butonları kullanarak CRUD işlemlerini gerçekleştirebilirsiniz.')
                    .addFields(
                        { name: '🆕 Create', value: 'Yeni bir kayıt eklemek için kullanılır.', inline: true },
                        { name: '✏️ Update', value: 'Var olan bir kaydı güncellemek için kullanılır.', inline: true },
                        { name: '🗑️ Delete', value: 'Bir kaydı silmek için kullanılır.', inline: true },
                        { name: '📋 Read', value: 'Kayıtları görüntülemek için kullanılır.', inline: true }
                    )
                    .setFooter({ text: 'Lütfen bir işlem seçin.' });

                const mainRow = new ActionRowBuilder()
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

                return await interaction.update({ embeds: [mainEmbed], components: [mainRow] });
            }

        } catch (error) {
            console.error('Hata oluştu:', error);
            if (interaction.replied || interaction.deferred) {
                return interaction.editReply({ content: '⚠️ Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
            } else {
                return interaction.reply({ content: '⚠️ Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
            }
        }
    });
};
