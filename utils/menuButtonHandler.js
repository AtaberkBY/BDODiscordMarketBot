const { query } = require('../db'); // Veritabanı bağlantısı
const { MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isButton() && interaction.customId.startsWith('crud_')) {
            // Buton tıklamaları burada işlenecek
            console.log(`📌 Butona basıldı: ${interaction.customId}`);

            const user = interaction.user;
            const oldEmbed = interaction.message.embeds[0];
            const oldButtons = interaction.message.components[0].components;
            let newDescription = oldEmbed.description;
            let footerText = '';
            let newFields = [];

            
            try {            
                switch (interaction.customId) {
                    case 'crud_create':
                        newDescription = '✅ **Create işlemi seçildi!** Yeni bir kayıt ekleyebilirsiniz.';
                        footerText = 'Yeni bir kayıt eklemek için lütfen bilgileri girin.';
                        newFields = [
                            { name: 'Name', value: 'Product Name', inline: true },
                            { name: 'Price', value: 'Product Price', inline: true },
                            { name: 'Stock', value: 'Product Stock', inline: true },
                            { name: 'Category', value: 'Product Category', inline: true },
                            { name: 'Description', value: 'Product Description', inline: true },
                            { name: 'Image', value: 'Product Image URL', inline: true }
                        ];
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

            // Mesajı güncelle
            await interaction.update({ embeds: [updatedEmbed] });
        }
        catch (error) {
            console.error('Hata oluştu:', error);
            interaction.reply({ content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.', flags: MessageFlags.Ephemeral });
        }
    }
        
    });
};
