const { MessageFlags } = require('discord.js');
const { query } = require('../db.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const timezoneMapping = {
            timezone_UTC: 'UTC',
            timezone_CET: 'Europe/Berlin',
            timezone_TR: 'Europe/Istanbul'
        };

        if (timezoneMapping[interaction.customId]) {
            const userId = interaction.user.id;
            const selectedTimezone = timezoneMapping[interaction.customId];
            console.log(`⏰ ${userId} selected ${selectedTimezone}`);
            try {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                // **Kullanıcının zaman dilimi daha önce eklenmiş mi kontrol et**
                const existingEntry = await query(`SELECT * FROM user_timezones WHERE user_id = $1`, [userId]);

                if (existingEntry.length > 0) {
                    // **Eğer zaman dilimi zaten varsa güncelle**
                    await query(`UPDATE user_timezones SET timezone = $1 WHERE user_id = $2`, [selectedTimezone, userId]);
                    await interaction.editReply({ content: `✅ Your timezone has been updated to **${selectedTimezone}**.`, flags: MessageFlags.Ephemeral });
                } else {
                    // **Yeni zaman dilimi ekle**
                    await query(`INSERT INTO user_timezones (user_id, timezone) VALUES ($1, $2)`, [userId, selectedTimezone]);
                    await interaction.editReply({ content: `✅ Your timezone has been set to **${selectedTimezone}**.`, flags: MessageFlags.Ephemeral });
                }
            } catch (error) {
                console.error('⚠️ Error updating timezone:', error);
                await interaction.editReply({ content: '⚠️ An error occurred while updating your timezone.', flags: MessageFlags.Ephemeral });
            }
        }
    }
};
