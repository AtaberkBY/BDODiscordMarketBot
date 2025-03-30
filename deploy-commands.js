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

function saveCommandsToFile(commands) {
    const filePath = path.join(__dirname, 'commands.json');
    fs.writeFileSync(filePath, JSON.stringify(commands, null, 2), 'utf8');
}

// Komutları dosyadan oku
function readCommandsFromFile() {
    const filePath = path.join(__dirname, 'commands.json');
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return [];
}




const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function updateCommands() {
    try {
        console.log('🔄 Komutlar güncelleniyor...');

        // Daha önce kaydedilen komutları dosyadan al
        const existingCommands = readCommandsFromFile();

        // Yeni komutları al
        const newCommandNames = commands.map(cmd => cmd.name);
        const newCommandDescriptions = commands.map(cmd => ({ name: cmd.name, description: cmd.description }));

        // Mevcut komutların adlarını al
        const existingCommandNames = existingCommands.map(cmd => cmd.name);
        const existingCommandDescriptions = existingCommands.map(cmd => ({ name: cmd.name, description: cmd.description }));

        const commandsMatch =
            existingCommandNames.length === newCommandNames.length &&
            existingCommandNames.every(name => 
                newCommandNames.includes(name) &&
                existingCommandDescriptions.find(cmd => cmd.name === name)?.description === 
                newCommandDescriptions.find(cmd => cmd.name === name)?.description
        );

        // Komutlar değişmiş mi?
        if (commandsMatch) {
            console.log('✅ Komutlar zaten güncel, yükleme yapılmadı.');
            return;
        }

        // Yeni komutları yükle
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        // Yeni komutları dosyaya kaydet
        saveCommandsToFile(commands);

        console.log('✅ Komutlar başarıyla güncellendi!');
    } catch (error) {
        console.error('❌ Komutları güncellerken hata oluştu:', error);
    }
}

updateCommands();
