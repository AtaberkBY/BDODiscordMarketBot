const axios = require('axios');
const { getEnhancementName } = require("../utils/utils");
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');  // EmbedBuilder kullanıyoruz.

const LIST_BASE_URL = "https://api.blackdesertmarket.com/list";
const REGION = "eu";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marketqueue')
        .setDescription('Displays items currently in the market queue.'),
    async execute(interaction) {
        try {
            // Defer the reply if no response has been sent yet
            if (!interaction.replied && !interaction.deferred) {
                await interaction.deferReply();
            }

            // Fetch data from the API
            const response = await axios.get(`${LIST_BASE_URL}/queue?region=${REGION}&lang=en-US`);

            const queueData = response.data.data;

            // Create an embed message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📜 Market Queue Items')
                .setDescription('Here is the list of items currently in the market queue:')
                .setTimestamp()
                .setFooter({ text: `BDO Market Tracker Bot` });

            if (queueData.length > 0) {
                for (const [index, item] of queueData.entries()) {
                    const itemText = getEnhancementName(item.enhancement, item.mainCategory, item.name);
                    embed.addFields({
                        name: `${index + 1}. ${itemText}`,
                        value: `Price: ${item.basePrice.toLocaleString("en-US")}\n Market Listing Time: <t:${Math.floor(item.endTime / 1000)}:R>`,
                        inline: false
                    });
                }

                // Send the embed message in the interaction
                await interaction.editReply({ embeds: [embed] });
            } else {
                // If the market queue is empty
                embed.setDescription('🔍 No items found in the market queue!');
                await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            console.error("⚠️ API HATASI:", error.response ? error.response.data : error.message);

            // Send an error message to the user via embed
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`⚠️${error.response.data.code ? ` Error Code: ${error.response.data.code}` : ' An Error Occurred'}`)
                .setDescription(`An error occurred while fetching data from the API. ${error.response.data.messages}`);

            // If no response has been sent, use reply, otherwise edit the reply
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
