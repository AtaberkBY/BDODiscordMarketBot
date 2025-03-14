require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');


const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
console.log(process.env.TOKEN);
console.log(process.env.CLIENT_ID);
async function updateCommands() {
    try {
        console.log('🔄 Komutlar güncelleniyor...');

        // Daha önce yüklenen komutları al
        const existingCommands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );

        // Eğer yeni komutlar, eski komutlarla birebir aynıysa güncelleme yapma
        if (JSON.stringify(existingCommands) === JSON.stringify(commands)) {
            console.log('✅ Komutlar zaten güncel, yükleme yapılmadı.');
            return;
        }

        // Yeni komutları yükle
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('✅ Komutlar başarıyla güncellendi!');
    } catch (error) {
        console.error('❌ Komutları güncellerken hata oluştu:', error);
    }
}

updateCommands();
