const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Market botu için özel bir kanal oluşturur.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const user = interaction.user;
        const channelName = `${user.username}-MarketBotChannel`;

        try {
            // Kullanıcının zaten bir kanalı olup olmadığını kontrol et
            const existingChannel = guild.channels.cache.find(channel => channel.name === channelName);

            if (existingChannel) {
                return await interaction.reply({ content: `❗ Zaten bir kanalınız var: ${existingChannel}`, ephemeral: true });
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

            await interaction.reply({ content: `✅ **Özel market kanalınız oluşturuldu!** ${newChannel}`, ephemeral: true });
        } catch (error) {
            console.error('⚠️ Hata oluştu:', error);
            await interaction.reply({ content: '⚠️ Bir hata oluştu, lütfen tekrar deneyin.', ephemeral: true });
        }
    }
};
