
const { REST, Routes, ChannelType } = require('discord.js');
const { query } = require('../db');

const userCache = new Map();


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);


function getEnhancementName(enhancement_level, categoryId) {
    const gearNames = { 16: "PRI:", 17: "DUO:", 18: "TRI:", 19: "TET:", 20: "PEN:" };
    const accessoryNames = { 1: "PRI:", 2: "DUO:", 3: "TRI:", 4: "TET:", 5: "PEN:", 6: "HEX:", 7: "SEP:", 8: "OCT:", 9: "NOV:", 10: "DEC:" };

    // Gear kategorileri (Silah, Zırh ve Lifeskill eşyaları)
    const gearCategories = [1, 5, 10, 15, 40];

    if (gearCategories.includes(categoryId)) {
        return enhancement_level <= 15 ? `+${enhancement_level}` : gearNames[enhancement_level] || `+${enhancement_level}`;
    } else if (categoryId === 20) { // Accessory kategorisi
        return accessoryNames[enhancement_level] || `+${enhancement_level}`;
    }
    return `+${enhancement_level}`; // Tanımsız bir kategori gelirse
}

async function getTrackedItems() {
    try {
        const trackedItemsQuery = `SELECT item_id, item_name, main_category, enhancement_level, target_price, user_id FROM tracked_items`;
        return await query(trackedItemsQuery);
    } catch (error) {
        console.error("❌ Veritabanından takip edilen eşyalar çekilemedi!", error);
        return [];
    }
}

async function getUserTime(userId) {
    const result = await query(`SELECT timezone FROM user_timezones WHERE user_id = $1`, [userId]);
    return result.rowCount > 0 ? result.rows[0].timezone : 'UTC';
}

async function getUserId(client) {
    try {
        const dbChannels = await query("SELECT server_id, channel_name, user_id FROM channels");
        let results = [];

        for (const { server_id, channel_name, user_id } of dbChannels) {
            if (userCache.has(server_id)) {
                const userChannels = userCache.get(server_id);

                const filteredData = userChannels.find(entry => entry.user_id === user_id);

                if (filteredData) {
                    results.push(filteredData);
                    continue;
                }
            }

            let guild = client.guilds.cache.get(server_id) || await client.guilds.fetch(server_id).catch(() => null);

            if (!guild) {
                console.warn(`⚠️ Bot, sunucuya erişemiyor veya yetkisi yok: ${server_id}`);
                continue;
            }

            try {
                const allChannels = await guild.channels.fetch();

                // Kategori kontrolü
                const category = allChannels.find(channel =>
                    channel.type === ChannelType.GuildCategory && channel.name === "Market Bot Channels"
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

                    // Eğer bu sunucu önbellekte yoksa, boş bir array ile başlat
                    if (!userCache.has(server_id)) {
                        userCache.set(server_id, []);
                    }

                    // Aynı kullanıcı ve kanal daha önce eklenmemişse ekle
                    const existingEntries = userCache.get(server_id);
                    if (!existingEntries.some(entry => entry.user_id === user_id && entry.channel_id === matchingChannel.id)) {
                        existingEntries.push({ user_id, channel_id: matchingChannel.id });
                    }

                    results.push({ user_id, channel_id: matchingChannel.id });
                    continue;
                } else {
                    console.warn(`⚠️ Veritabanında kayıtlı kanal sunucuda bulunamadı: ${channel_name}`);
                }

            } catch (channelError) {
                console.error(`❌ Sunucu (${guild.name}) için kanallar alınırken hata oluştu:`, channelError);
            }
        }
        return JSON.stringify(results);
    } catch (error) {
        console.error("❌ Genel hata oluştu:", error);
    }
}

module.exports = { getEnhancementName, getUserId, getTrackedItems, getUserTime };
