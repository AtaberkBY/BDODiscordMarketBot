const axios = require("axios");
const { query } = require("./db"); // Veritabanı işlemleri için db.js dosyasını içe aktar

// !ping komutu
function pingCommand(message) {
    message.channel.send("🏓 Pong!");
}

// !dbtest komutu (Veritabanı test)
async function dbTestCommand(message) {
    try {
        const rows = await query("SELECT * FROM bdo_items"); // db.js içindeki query fonksiyonunu kullanıyoruz.
        if (rows.length === 0) {
            message.channel.send("📂 Veri tabanında hiç kayıt yok.");
        } else {
            let response = "📜 **Items Tablosundaki Veriler:**\n";
            rows.forEach((row, index) => {
                response += `🔹 **${index + 1}.** ${row.item_name}\n`;
            });
            message.channel.send(response);
        }
    } catch (err) {
        console.error("❌ Veri tabanı hatası:", err);
        message.channel.send("⚠️ Veri tabanı sorgusu sırasında hata oluştu.");
    }
}

// !marketQueue komutu (Market verileri)
async function marketQueueCommand(message, LIST_BASE_URL, REGION, getEnhancementName) {
    try {
        const response = await axios.get(`${LIST_BASE_URL}/queue?region=${REGION}&lang=en-US`);
        const queueData = response.data.data;

        if (queueData.length > 0) {
            let response = `📜 **Market Sırasındaki Ürünler:**\n`;
            queueData.forEach((item, index) => {
                response += `🔹 **${index + 1}.** ${getEnhancementName(item.enhancement, item.mainCategory)} ${item.name} - Fiyat: ${item.basePrice.toLocaleString("tr-TR")} - Bitiş: ${new Date(item.endTime).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}\n`;
            });
            message.channel.send(response);
        } else {
            message.channel.send("🔍 Market sırasında ürün bulunamadı!");
        }
    } catch (error) {
        console.error("⚠️ API HATASI:", error.response ? error.response.data : error.message);
        message.channel.send("⚠️ API'den veri alınırken hata oluştu.");
    }
}

// Komutları dışa aktar
module.exports = {
    pingCommand,
    dbTestCommand,
    marketQueueCommand,
};
