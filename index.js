require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, MessageFlags } = require('discord.js');
const axios = require('axios');
const { testDBConnection, query } = require('./db');
const { getEnhancementName, getUserId, getTrackedItems, checkAndInsertItem } = require('./utils/utils.js');
const fs = require('fs');
const path = require('path');


const notifiedItems = new Map();
const LIST_BASE_URL = "https://api.blackdesertmarket.com/list";
const REGION = "eu";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} başarıyla çalıştı!`);
});


async function checkPrice() {
    try {
        const trackedItems = await getTrackedItems();
        if (trackedItems.length === 0) {
            console.log("📂 Takip edilen eşya bulunamadı!")
            return;
        }

        const response = await axios.get(`${LIST_BASE_URL}/queue?region=${REGION}&lang=en-US`);
        const queueData = response.data.data;
        const userData = await getUserId(client);
        if (!userData) {
            console.error("❌ Kullanıcı verisi bulunamadı!");
            return;
        }

        let users = JSON.parse(userData);
        if (!Array.isArray(users)) {
            users = [users]; 
        }

        const trackedMap = new Map();
        for (const tracked of trackedItems) {
            const key = `${tracked.item_id}-${tracked.enhancement_level}`;
            if (!trackedMap.has(key)) {
                trackedMap.set(key, []);
            }
            trackedMap.get(key).push(tracked);
        }



        for (const item of queueData) {
            await checkAndInsertItem(item.id, item.name, item.mainCategory, item.subCategory);
            const key = `${item.id}-${item.enhancement}`;
            const matchedItems = trackedMap.get(key) || [];

            for(const tracked of matchedItems) {
                if(item.basePrice > tracked.target_price) continue;
                timestamp = item.endTime;
                const formattedPrice = item.basePrice.toLocaleString("en-US");
                const itemKey = `${tracked.user_id}-${item.id}-${item.basePrice}-${item.enhancement}`; 

                if (!notifiedItems.has(itemKey)) {
                    const userChannels = users.filter(user => user.user_id === tracked.user_id);
                    if (userChannels) {
                        for (const user of userChannels) {
                            sendDiscordNotification(
                                formattedPrice,
                                timestamp,
                                item.enhancement,
                                tracked.main_category,
                                tracked.item_name,
                                user.user_id,
                                user.channel_id
                            );
                        }
                        notifiedItems.set(itemKey, Date.now());
                    }
                }
            }

        }
            
    } catch (error) {
        console.error("⚠️ API HATASI - Index:", error.response ? error.response.data : error.message);
    }
}

async function sendDiscordNotification(formattedPrice, timestamp, enhancement_level, itemCategoryId, itemName, user_id, channel_id) {

        const channel = client.channels.cache.get(channel_id);
        if (channel) {
            const embedMessage = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🚨 BDO Market 🚨')
            .setDescription(`**${getEnhancementName(enhancement_level, itemCategoryId, itemName)}** has been listed at a low price!`)
            .addFields(
                {name:'💰 **Price**', value:`**${formattedPrice}**`, inline: true },
                {name:'📅 **Market Listing Time**', value:`**<t:${Math.floor(timestamp/ 1000)}:R>**`, inline: true }
            )
            .setTimestamp()
            .setFooter({text: `BDO Market Track Bot`});
            try {
                await channel.send(`<@${user_id}>`).then( await channel.send({ embeds: [embedMessage] }));
            } catch (error) {
                console.error("❌ Discord mesajı gönderilemedi!", error.message);
            }
        } else {
            console.error("❌ Kanal bulunamadı! Lütfen `.env` dosyanızda DISCORD_CHANNEL_ID değerini doğru girdiğinizden emin olun.");
        }
    }




const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    commands.push(command);
}

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {

    const command = commands.find(cmd => cmd.data.name === interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ ${interaction.commandName} komutunda hata oluştu:`, error);
        await interaction.reply({ content: "⚠️ An error occurred when running the command!", flags: MessageFlags.Ephemeral });
    }
    }

});

testDBConnection();

setInterval(() => {
    const now = Date.now();
    for (let [key, time] of notifiedItems) {
        if (now - time >= 16 * 60 * 1000) {
            notifiedItems.delete(key);
        }
    }
}, 60_000); // 1 dakikada bir kontrol et

setInterval(checkPrice, 60_000);

checkPrice();

client.login(process.env.TOKEN);
