
const { REST, Routes, ChannelType } = require('discord.js');
const { query } = require('../db');

const userCache = new Map();


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);


function getEnhancementName(enhancement_level, categoryId, itemName) {
    const gearNames = { 16: "PRI: ", 17: "DUO: ", 18: "TRI: ", 19: "TET: ", 20: "PEN: " };
    const accessoryNames = { 1: "PRI: ", 2: "DUO: ", 3: "TRI: ", 4: "TET: ", 5: "PEN: ", 6: "HEX: ", 7: "SEP: ", 8: "OCT: ", 9: "NOV: ", 10: "DEC: " };

    const fallenGods = ["Labreska's Helmet", "Fallen God's Armor", "Ator's Shoes", "Dahn's Gloves"]
    // Gear kategorileri (Silah, Zırh ve Lifeskill eşyaları)
    const gearCategories = [1, 5, 10, 15, 40];
    const noEnhancementNameCategories = [ 70 ];
    if (gearCategories.includes(categoryId) && !itemName.includes("Godr-Ayed") && !fallenGods.some(item => itemName.includes(item))) {
        console.log(itemName, enhancement_level);
        return enhancement_level <= 15 ? `+${enhancement_level} ${itemName}` : gearNames[enhancement_level]+itemName || `+${enhancement_level} ${itemName}`;
        //Godr-ayed kategorisindeki eşyaların enhancement level'i +15 olacak
    } else if(gearCategories.includes(categoryId) && itemName.includes("Godr-Ayed")){
        enhancement_level+=15
        return gearNames[enhancement_level]+itemName;
    } else if (categoryId === 20) { // Accessory kategorisi
        return accessoryNames[enhancement_level]+itemName;
    } else if (noEnhancementNameCategories.includes(categoryId) || enhancement_level === 0 || fallenGods.some(item => itemName.includes(item))) {
        return itemName; // Enhancement isimleri olmayan kategoriler
    }
    return `+${enhancement_level} ${itemName}`; // Tanımsız bir kategori gelirse
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

async function checkAndInsertItem(itemId, itemName, itemCategoryId) {
    let itemSubCategoryId;
    const fallenGodItems = ["Desperate","Distorted","Silent","Wailing","Obliterating"]
    const subCategoryMapping = {
    1: {    
        "Longsword": 1,
        "Longbow": 2,
        "Amulet": 3,
        "Axe": 4,
        "Shortsword": 5,
        "Blade": 6,
        "Staff": 7,
        "Kriegsmesse": 8,
        "Gauntlet": 9,
        "Crescent Pendulum": 10,
        "Crossbow": 11,
        "Florang" : 12,
        "Battle Axe" : 13,
        "Shamshir" : 14,
        "Morning Star" : 15,
        "Kyve" : 16,
        "Serenaca" : 17,
        "Slayer" : 18,
        "Swallowtail Fan" : 19,
        "Foxspirit Charm" : 20,
        "Hammers" : 21,
        "Hwando" : 22,
        "Revolver" : 23,
    },
    5: {
        "Shield": 1,
        "Dagger": 2,
        "Talisman": 3,
        "Ornamental Knot": 4,
        "Trinket": 5,
        "Horn Bow": 6,
        "Kunai": 7,
        "Shuriken": 8,
        "Vambrace": 9,
        "Noble Sword": 10,
        "Ra'ghon" : 11,
        "Vitclari" : 12,
        "Haladie" : 13,
        "Quoratum" : 14,
        "Mareca" : 15,
        "Shard" : 16,
        "Do Stave" : 17,
        "Binyeo Knife" : 18,
        "Gravity Cores" : 19,
        "Gombangdae" : 20,
        "Shotgun" : 21,
    },
    10: {
        "Greatsword": 1,
        "Scythe": 2,
        "Iron Buster": 3,
        "Kamasylven Sword": 4,
        "Celestial Bo Staff": 5,
        "Lancia": 6,
        "Crescent Blade": 7,
        "Kerispear": 8,
        "Sura Katana": 9,
        "Sah Chakram": 10,
        "Aad Sphera": 11,
        "Godr Sphera": 12,
        "Vediant" : 13,
        "Gardbrace" : 14,
        "Cestus" : 15,
        "Crimson Glaives" : 16,
        "Greatbow" : 17,
        "Jordun" : 19,
        "Dual Glaives" : 20,
        "Sting" : 21,
        "Kibelius" : 22,
        "Patraca" : 23,
        "Trion" : 24,
        "Soul Tome" : 25,
        "Foxtail Fans" : 26,
        "Sledgehammer" : 27,
        "Enlightened Blade" : 28,
        "Lil' Devil" : 29

    },
    15: {
        "Helmet": 1,
        "Armor": 2,
        "Gloves": 3,
        "Shoes": 4,
        "Clothes" : 5
    },
    20: {
        "Ring": 1,
        "Necklace": 2,
        "Earring": 3,
        "Belt" : 4
    },
    40: {
        "Lumbering Axe" : 1,
        "Fluid Collector" : 2,
        "Butcher Knife" : 3,
        "Pickaxe" : 4,
        "Hoe" : 5,
        "Tanning Knife" : 6,
        "Riding Crop": 10,
        "Fishing Chair": 10,
        "Hunting Bag": 10,
        "Ladle": 10,
        "Flask": 10,
        "Sailing Log": 10,
        "Processing Stone": 10    
    },
    50: {
        "Crystal" : 1,
    },
    70: {
        "Ship License" : 1,
        "(Chiro's Figurehead)" : 6,
        "(Chiro's Black Plating)" : 7,
        "(Chiro's Cannon)" : 8,
        "(Chiro's Sail)" : 9
    }
}
    const specialItemMapping = {
        "Ogre Ring": { categoryId: 20, subCategoryId: 2 },
        "Laytenn's Power Stone": { categoryId: 20, subCategoryId: 2 },
        "Narc Ear Accessory": { categoryId: 20, subCategoryId: 3 },
        "Vaha's Dawn": { categoryId: 20, subCategoryId: 3 },
    }
    try {
        const existingItem = await query(
            'SELECT * FROM items WHERE item_id = $1',
            [itemId]
        );

        if (existingItem.length > 0) {
            return;
        }
        if (specialItemMapping[itemName]) {
            itemCategoryId = specialItemMapping[itemName].categoryId;
            itemSubCategoryId = specialItemMapping[itemName].subCategoryId;
        } 
        // Yoksa, normal kategori eşlemesine bakıyoruz
        else if (subCategoryMapping[itemCategoryId]) {
            const matchedKey = Object.keys(subCategoryMapping[itemCategoryId])
                .find(key => itemName.includes(key));
        
            if (matchedKey) {
                itemSubCategoryId = subCategoryMapping[itemCategoryId][matchedKey];
            }
        }
        

        if(fallenGodItems.some(fallenGodItem => itemName.includes(fallenGodItem))){
            const itemNameParts = itemName.split(" ");
            itemName = itemNameParts.slice(1).join(" ");
        }

        // Eğer eşya yoksa, yeni kayıt ekle
        await query(
            'INSERT INTO items (item_id, item_name, main_category, sub_category) VALUES ($1, $2, $3, $4)',
            [itemId, itemName, itemCategoryId, itemSubCategoryId]
        );

        console.log(`🆕 Yeni eşya eklendi: ${itemName} (ID: ${itemId})`);

    } catch (error) {
        console.error('❌ Eşya kontrolü ve ekleme sırasında hata oluştu:', error);
    }
}

module.exports = { getEnhancementName, getUserId, getTrackedItems, checkAndInsertItem };
