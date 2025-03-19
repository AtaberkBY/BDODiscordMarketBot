const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder, PermissionsBitField, ChannelType, MessageFlags, ButtonStyle } = require('discord.js');
const { query } = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Creates a private tracking channel and allows you to set your timezone.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const user = interaction.user;
        const channelName = `${user.username}-MBC`;

        try {

            const allChannels = await guild.channels.fetch();
            const categories = allChannels.filter(channel => channel.type === ChannelType.GuildCategory);
            let category = categories.find(category => category.name === 'Market Bot Channels');
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
                return await interaction.reply({ content: `❗ You already have a channel: ${existingChannel}`, flags: MessageFlags.Ephemeral });
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

            const insertChannelQuery = `INSERT INTO channels (channel_id, user_id, server_id, channel_name) VALUES ($1, $2, $3, $4)`;
            await query(insertChannelQuery, [newChannel.id, user.id, guild.id, newChannel.name]);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🌍 Select Your Timezone')
                .setDescription('Please select your timezone from the list below.')

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('timezone_UTC')
                    .setLabel('UTC')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('timezone_CET')
                    .setLabel('CET (Berlin)')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('timezone_TR')
                    .setLabel('TR (Istanbul)')
                    .setStyle(ButtonStyle.Primary)

            );

            await newChannel.send({ embeds: [embed], components: [actionRow] });

            await interaction.reply({ content: `✅ **Your private market channel has been created!** ${newChannel}`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('⚠️ Hata oluştu:', error);
            await interaction.reply({ content: '⚠️ An error occurred, please try again.', flags: MessageFlags.Ephemeral });
        }
    }
};
