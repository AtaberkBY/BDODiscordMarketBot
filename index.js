require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
const { testDBConnection } = require('./db');
const { getEnhancementName, getUserId} = require('./utils');
const fs = require('fs');
const path = require('path');


const LIST_BASE_URL = "https://api.blackdesertmarket.com/list";
const REGION = "eu";
const TARGET_PRICE = 30_000_000_000;
const ITEM_NAME = "Deboreka Ring";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} başarıyla çalıştı!`);
});

async function checkPrice() {
    try {
        const response = await axios.get(`${LIST_BASE_URL}/queue?region=${REGION}&lang=en-US`);
        const queueData = response.data.data;
        let items = queueData.filter(data => data.name.includes(ITEM_NAME) && data.enhancement == 4);
        if(items.length > 0) {
            items.forEach(item => {
                const price = item.basePrice;
                const timestamp = new Date(item.endTime).toLocaleString("tr-TR" , {timeZone: "Europe/Istanbul"});
    
                let formattedPrice = price.toLocaleString("tr-TR");
                const enhancementLevel = item.enhancement;
                const itemCategoryId = item.mainCategory;
                if (price <= TARGET_PRICE) {
                    setTimeout(() => {
                        sendDiscordNotification(formattedPrice, timestamp, enhancementLevel, itemCategoryId);
                    }, 5_000);
                }
                
            });
        }
        else {
            console.log(`🔍 ${ITEM_NAME} bulunamadı!`);
        }
        
    } catch (error) {
        console.error("⚠️ API HATASI:", error.response ? error.response.data : error.message);
    }
}

async function sendDiscordNotification(formattedPrice, timestamp, enhancementLevel, itemCategoryId) {
    const userData = await getUserId(client);
    if (!userData) {
        console.error("❌ Kullanıcı verisi bulunamadı!");
        return;
    }
    const users = JSON.parse(userData); 
    if (!Array.isArray(users) || users.length === 0) {
        console.error("❌ Kullanıcı verisi bulunamadı!");
        return;
    }

    // Her kullanıcı için bildirim gönder
    users.forEach(async ({ user_id, channel_id }) => {
        const channel = client.channels.cache.get(channel_id);
        if (channel) {
            const embedMessage = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🚨 BDO Market 🚨')
            .setDescription(`**${getEnhancementName(enhancementLevel, itemCategoryId)}${ITEM_NAME}** düşük fiyata listelendi!`)
            .addFields(
                {name:'💰 **Fiyat**', value:`**${formattedPrice}**`, inline: true },
                {name:'📅 **Market Yayın Zamanı**', value:`**${timestamp}**`, inline: true }
            )
            .setTimestamp()
            .setFooter({text: `BDO Market Takip Botu - ${new Date().toLocaleString("tr-TR", {timeZone: "Europe/Istanbul"})}`});
            try {
                await channel.send(`<@${user_id}>`).then( await channel.send({ embeds: [embedMessage] }));
            } catch (error) {
                console.error("❌ Discord mesajı gönderilemedi!", error.message);
            }
        } else {
            console.error("❌ Kanal bulunamadı! Lütfen `.env` dosyanızda DISCORD_CHANNEL_ID değerini doğru girdiğinizden emin olun.");
        }
    });
}



const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    commands.push(command);
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.find(cmd => cmd.data.name === interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ ${interaction.commandName} komutunda hata oluştu:`, error);
        await interaction.reply({ content: "⚠️ Komutu çalıştırırken hata oluştu!", ephemeral: true });
    }
});


testDBConnection();

setInterval(checkPrice, 1_000*60*15);

checkPrice();
client.login(process.env.TOKEN);
