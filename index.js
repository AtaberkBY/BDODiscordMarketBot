require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { pingCommand, dbTestCommand, marketQueueCommand } = require('./commands');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { testDBConnection } = require('./db');


const LIST_BASE_URL = "https://api.blackdesertmarket.com/list";
const REGION = "eu";
const TARGET_PRICE = 38_000_000_000;
const ITEM_NAME = "Deboreka Ring";


function getEnhancementName(level, categoryId) {
    const gearNames = { 16: "PRI:", 17: "DUO:", 18: "TRI:", 19: "TET:", 20: "PEN:" };
    const accessoryNames = { 1: "PRI:", 2: "DUO:", 3: "TRI:", 4: "TET:", 5: "PEN:", 6: "HEX:", 7: "SEP:", 8: "OCT:", 9: "NOV:", 10: "DEC:" };

    // Gear kategorileri (Silah ve Zırh ve Lifeskill eşyaları)
    const gearCategories = [1, 5, 10, 15, 40];

    if (gearCategories.includes(categoryId)) {
        return level <= 15 ? `+${level}` : gearNames[level] || `+${level}`;
    } else if (categoryId === 20) { // Accessory kategorisi
        return accessoryNames[level] || `+${level}`;
    }
    return `+${level}`; // Tanımsız bir kategori gelirse
}

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
                    sendDiscordNotification(formattedPrice, timestamp, enhancementLevel, itemCategoryId);
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
    const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
    if(channel) {
        const embedMessage = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚨 BDO Market 🚨')
        .setDescription(`**${getEnhancementName(enhancementLevel,itemCategoryId)}${ITEM_NAME}** düşük fiyata listelendi!`)
        .addFields(
            {name:'💰 **Fiyat**', value:`**${formattedPrice}**`, inline: true },
            {name:'📅 **Market Yayın Zamanı**', value:`**${timestamp}**`, inline: true }
        )
        .setTimestamp()
        .setFooter({text: 'BDO Market Takip Botu'});
        try {
            await channel.send(`<@${process.env.DISCORD_USER_ID}>`).then( await channel.send({ embeds: [embedMessage] }));
        }
        catch (error) {
            console.error("❌ Discord mesajı gönderilemedi!", error.message);
        }
}
    else {
        console.error("❌ Kanal bulunamadı! Lütfen `.env` dosyanızda DISCORD_CHANNEL_ID değerini doğru girdiğinizden emin olun.");
    }
}



client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const command = message.content.toLowerCase();

    if (command === "!ping") {
        pingCommand(message);
    } else if (command === "!dbtest") {
        await dbTestCommand(message);
    } else if (command === "!marketqueue") {
        await marketQueueCommand(message, LIST_BASE_URL, REGION, getEnhancementName);
    }
});


testDBConnection();
  

setInterval(checkPrice, 1_000*60*15);

client.login(process.env.TOKEN);
