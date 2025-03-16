
const { REST, Routes, ChannelType } = require('discord.js');
const { query } = require('./db');

const userCache = new Map();


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);


function getEnhancementName(enhancementLevel, categoryId) {
    const gearNames = { 16: "PRI:", 17: "DUO:", 18: "TRI:", 19: "TET:", 20: "PEN:" };
    const accessoryNames = { 1: "PRI:", 2: "DUO:", 3: "TRI:", 4: "TET:", 5: "PEN:", 6: "HEX:", 7: "SEP:", 8: "OCT:", 9: "NOV:", 10: "DEC:" };

    // Gear kategorileri (Silah, Zırh ve Lifeskill eşyaları)
    const gearCategories = [1, 5, 10, 15, 40];

    if (gearCategories.includes(categoryId)) {
        return enhancementLevel <= 15 ? `+${enhancementLevel}` : gearNames[enhancementLevel] || `+${enhancementLevel}`;
    } else if (categoryId === 20) { // Accessory kategorisi
        return accessoryNames[enhancementLevel] || `+${enhancementLevel}`;
    }
    return `+${enhancementLevel}`; // Tanımsız bir kategori gelirse
}


async function getUserId(client) {
    try {

        for (const guild of client.guilds.cache.values()) {
            const serverId = guild.id;

            if(userCache.has(serverId)) {
                const { user_id, channel_id } = userCache.get(serverId);
                console.log(`🔍 Sunucu ID'si önbellekte bulundu: ${serverId}`);
                return JSON.stringify({user_id:user_id,channel_id:channel_id}) // Hem user_id hem de channel_id döndür
            }
        }
        
        // Veritabanındaki tüm kayıtları önceden çekelim
        const dbChannels = await query("SELECT server_id, channel_name, user_id, channel_id FROM channels");

        // Sunucuları tek tek kontrol et
        for (const { server_id, channel_name, user_id, channel_id } of dbChannels) {
            let guild = client.guilds.cache.get(server_id) || await client.guilds.fetch(server_id).catch(() => null);

            if (!guild) {
                console.warn(`⚠️ Bot, sunucuya erişemiyor veya yetkisi yok: ${server_id}`);
                continue;
            }

            try {
                const allChannels = await guild.channels.fetch();

                // Kategori kontrolü
                const category = allChannels.find(channel =>
                    channel.type === ChannelType.GuildCategory && channel.name === 'Market Bot Channels'
                );

                if (!category) {
                    console.warn(`⚠️ Sunucuda "Market Bot Channels" kategorisi bulunamadı: ${guild.name}`);
                    continue;
                }

                // "-MBC" içeren metin kanallarını filtrele
                const matchingChannel = allChannels.find(channel => 
                    channel.parentId === category.id &&
                    channel.name === channel_name // Veritabanındaki isimle tam eşleşme kontrolü
                );

                if (matchingChannel) {
                    console.log(`✅ Eşleşme bulundu: ${matchingChannel.name} - Kullanıcı ID: ${user_id}`);
                    userCache.set(server_id, { user_id, channel_id: matchingChannel.id });
                    return JSON.stringify({user_id:user_id,channel_id: matchingChannel.id}) // Hem user_id hem de channel_id döndür
                } else {
                    console.warn(`⚠️ Veritabanında kayıtlı kanal sunucuda bulunamadı: ${channel_name}`);
                }

            } catch (channelError) {
                console.error(`❌ Sunucu (${guild.name}) için kanallar alınırken hata oluştu:`, channelError);
            }
        }
    } catch (error) {
        console.error("❌ Genel hata oluştu:", error);
    }
}

module.exports = { getEnhancementName, getUserId };
