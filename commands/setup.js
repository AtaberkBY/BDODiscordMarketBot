const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
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

            const allChannels = await guild.channels.fetch();
            const categories = allChannels.filter(channel => channel.type === ChannelType.GuildCategory);
            console.log(categories);
            let category = categories.find(category => category.name === 'Market Bot Channels');
            console.log(category);
            if (!category) {
                category = await guild.channels.create({
                    name: 'Market Bot Channels',
                    type: ChannelType.GuildCategory,
                  });
            }


            const existingChannel = allChannels.find(channel => 
                channel.parentId === category.id && channel.name.toLowerCase() === channelName.toLowerCase()
            );

            if (existingChannel) {
                return await interaction.reply({ content: `❗ Zaten bir kanalınız var: ${existingChannel}`, Flags: 64, ephemeral: true });
            }

            // Kanalı oluştur
            const newChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText, // Metin kanalı
                parent: category.id, // Kategoriye ekle
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
