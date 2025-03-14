// Enhancement seviyesini oyun terminolojisine çeviren fonksiyon
function getEnhancementName(enhancementLevel, categoryId) {
    const gearNames = { 16: "PRI:", 17: "DUO:", 18: "TRI:", 19: "TET:", 20: "PEN:" };
    const accessoryNames = { 1: "PRI:", 2: "DUO:", 3: "TRI:", 4: "TET:", 5: "PEN:", 6: "HEX:", 7: "SEP:", 8: "OCT:", 9: "NOV:", 10: "DEC:" };

    // Gear kategorileri (Silah, Zırh ve Lifeskill eşyaları)
    const gearCategories = [1, 5, 10, 15, 40];

    if (gearCategories.includes(categoryId)) {
        return enhancementLevel <= 15 ? `+${enhancementLevel}` : gearNames[enhancementLevel] || `+${enhancementLevel}`;
    } else if (categoryId === 20) { // Accessory kategorisi
        return accessoryNames[enhancementLevel] || `+${enhancementLevel}`;
    }
    return `+${enhancementLevel}`; // Tanımsız bir kategori gelirse
}

// Başka dosyalarda kullanabilmek için fonksiyonu dışa aktar
module.exports = { getEnhancementName };
