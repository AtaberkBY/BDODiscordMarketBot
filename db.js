const { Pool } = require("pg");

// PostgreSQL bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testDBConnection() {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");
        console.log("✅ Veritabanı bağlantısı başarılı:", result.rows[0].current_time);
    } catch (error) {
        console.error("❌ Veritabanı bağlantı hatası:", error);
    }
}

// Veritabanına sorgu çalıştırma fonksiyonu
async function query(text, params) {
    try {
        const result = await pool.query(text, params);
        return result.rows;
    } catch (error) {
        console.error("❌ Veritabanı sorgu hatası:", error);
        throw error;
    }
}

// Dışa aktar
module.exports = {
    pool,
    query,
    testDBConnection,
};