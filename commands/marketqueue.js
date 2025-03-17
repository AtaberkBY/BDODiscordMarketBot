const axios = require('axios');
const { getEnhancementName } = require("../utils");
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');  // EmbedBuilder kullanıyoruz.

const LIST_BASE_URL = "https://api.blackdesertmarket.com/list";
const REGION = "eu";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marketqueue')
        .setDescription('Market sırasındaki itemleri gösterir.'),
    async execute(interaction) {
        try {
            // Yanıt verilmediyse, etkileşimi ertele
            if (!interaction.replied) {
                await interaction.deferReply();
            }

            // API'den veri çekme
            const response = await axios.get(`${LIST_BASE_URL}/queue?region=${REGION}&lang=en-US`);
            const queueData = response.data.data;

            // Embed mesajı oluşturma
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📜 Market Sırasındaki Ürünler')
                .setDescription('Aşağıda market sırasındaki itemlerin listesi bulunmaktadır:')
                .setFooter({ text: `BDO Market Tracker - ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}` });

            if (queueData.length > 0) {
                queueData.forEach((item, index) => {
                    embed.addFields({
                        name: `${index + 1}. ${getEnhancementName(item.enhancement, item.main_category)} ${item.name}`,
                        value: `Fiyat: ${item.basePrice.toLocaleString("tr-TR")}\nBitiş Zamanı: ${new Date(item.endTime).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
                        inline: false
                    });
                });

                // Embed mesajını etkileşimde gönder
                await interaction.editReply({ embeds: [embed] });
            } else {
                // Eğer market sırası boşsa
                embed.setDescription('🔍 Market sırasında ürün bulunamadı!');
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("⚠️ API HATASI:", error.response ? error.response.data : error.message);

            // Hata durumunda kullanıcıya bir embed mesajı ile yanıt ver
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⚠️ API Hatası')
                .setDescription('API’den veri alınırken bir hata oluştu.');

            // Eğer etkileşimde yanıt verilmediyse, doğrudan reply kullan
            if (!interaction.replied) {
                await interaction.reply({ embeds: [errorEmbed] });
            } else {
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        }
    },
};
