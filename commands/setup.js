const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder, PermissionsBitField, ChannelType, MessageFlags, ButtonStyle } = require('discord.js');
const { query } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Creates a private tracking channel for the user.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const user = interaction.user;
        const channelName = `${user.username}-MBC`.toLowerCase(); // Kullanıcı adı bazlı normalize edilmiş kanal ismi

        try {
            const allChannels = await guild.channels.fetch();
            
            // "Market Bot Channels" kategorisini bul veya oluştur
            let category = allChannels.find(channel => channel.type === ChannelType.GuildCategory && channel.name === 'Market Bot Channels');
            if (!category) {
                category = await guild.channels.create({
                    name: 'Market Bot Channels',
                    type: ChannelType.GuildCategory,
                });
            }

            // Tüm veritabanı kanallarını al
            const allDbChannels = await query(`SELECT server_id, channel_id FROM channels`);
            
            // 🔹 **Silinen Kanalları Tespit Edip Temizleme (Tüm Sunucular İçin)**
            for (const { server_id, channel_id } of allDbChannels) {
                const guild = interaction.client.guilds.cache.get(server_id);
                if (!guild) {
                    console.log(`⚠️ Missing server in Discord: ${server_id}`);
                    await query(`DELETE FROM channels WHERE server_id = $1`, [server_id]);
                    console.log(`🗑️ Deleted missing server from DB: ${server_id}`);
                    continue;
                }

                const allGuildChannels = guild.channels.cache.map(channel => channel.id);
                if (!allGuildChannels.includes(channel_id)) {
                    console.log(`⚠️ Missing channel in Discord: ${channel_id} (Server: ${server_id})`);
                    await query(`DELETE FROM channels WHERE channel_id = $1`, [channel_id]);
                    console.log(`🗑️ Deleted missing channel from DB: ${channel_id}`);
                }
            }

            // 🔹 **Kullanıcının Kanalı Zaten Var mı?**
            if (allChannels.some(channel => channel.parentId === category.id && channel.name.toLowerCase() === channelName)) {
                return await interaction.reply({ 
                    content: `❗ You already have a channel in Market Bot Channels.`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // 🔹 **Yeni Kanal Oluştur**
            const newChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                    }
                ]
            });

            // 🔹 **Veritabanına Kanalı Kaydet**
            await query(
                `INSERT INTO channels (channel_id, user_id, server_id, channel_name) VALUES ($1, $2, $3, $4)`,
                [newChannel.id, user.id, guild.id, newChannel.name]
            );

            await interaction.reply({ 
                content: `✅ **Your private market channel has been created!** ${newChannel}`, 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error('⚠️ Hata oluştu:', error);
            await interaction.reply({ 
                content: '⚠️ An error occurred, please try again.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};
