const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Elastic Beanstalk ortam değişkenini kullan
  ssl: { rejectUnauthorized: false } // Neon için gerekli
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL bağlantısı başarılı!"))
  .catch(err => console.error("❌ PostgreSQL bağlantı hatası:", err));

module.exports = pool;
