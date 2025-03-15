require('dotenv').config();
const { REST, Routes } = require('discord.js');
const path = require("path");
const fs = require('fs');


const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    
    // Eğer command.data tanımlanmışsa, JSON'a çevir
    if (command.data) {
        commands.push(command.data.toJSON());
    } else {
        console.error(`Komut dosyasında 'data' özelliği eksik: ${file}`);
    }
}




const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function updateCommands() {
    try {
        console.log('🔄 Komutlar güncelleniyor...');

        // Daha önce yüklenen komutları al
        const existingCommands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );

        const existingCommandNames = existingCommands.map(cmd => cmd.name);
        const newCommandNames = commands.map(cmd => cmd.name);
        
        if (
            existingCommandNames.length === newCommandNames.length &&
            existingCommandNames.every(name => newCommandNames.includes(name))
        ) {
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
