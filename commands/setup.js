const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { query } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Market botu için özel bir kanal oluşturur.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const user = interaction.user;
        const channelName = `${user.username}-MBC`;

        try {
            const channels = await guild.channels.fetch();
            const existingChannel = channels.find(channel => channel.name.toLowerCase() === channelName.toLowerCase());

            if (existingChannel) {
                return await interaction.reply({ content: `❗ Zaten bir kanalınız var: ${existingChannel}`, Flags: 64, ephemeral: true });
            }

            // Kanalı oluştur
            const newChannel = await guild.channels.create({
                name: channelName,
                type: 0, // Metin kanalı
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id, // Herkese kapalı yap
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: user.id, // Kullanıcıya erişim izni ver
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    },
                    {
                        id: interaction.client.user.id, // Bota izin ver
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    }
                ]
            });

            const insertQuery = `INSERT INTO channels (channel_id, user_id) VALUES ($1, $2)`;
            await query(insertQuery, [newChannel.id, user.id]);

            await interaction.reply({ content: `✅ **Özel market kanalınız oluşturuldu!** ${newChannel}`, Flags: 64, ephemeral: true });
        } catch (error) {
            console.error('⚠️ Hata oluştu:', error);
            await interaction.reply({ content: '⚠️ Bir hata oluştu, lütfen tekrar deneyin.', Flags: 64, ephemeral: true });
        }
    }
};
