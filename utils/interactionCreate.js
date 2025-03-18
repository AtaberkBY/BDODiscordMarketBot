const { Events, MessageFlags } = require('discord.js');
const { query } = require('../database/db.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith('timezone_')) {
            const timezone = interaction.customId.replace('timezone_', ''); // Örn: 'timezone_EST' → 'EST'

            try {
                // Kullanıcının zaman dilimini veritabanına kaydet
                const updateQuery = `INSERT INTO user_timezones (user_id, timezone) 
                                     VALUES ($1, $2) 
                                     ON CONFLICT (user_id) DO UPDATE SET timezone = EXCLUDED.timezone`;
                await query(updateQuery, [interaction.user.id, timezone]);

                await interaction.reply({ content: `✅ Your timezone has been set to **${timezone}**!`, flags: MessageFlags.Ephemeral });
            } catch (error) {
                console.error('⚠️ Error saving timezone:', error);
                await interaction.reply({ content: '⚠️ An error occurred while saving your timezone.', flags: MessageFlags.Ephemeral });
            }
        }
    },
};
