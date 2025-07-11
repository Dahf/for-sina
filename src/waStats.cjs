const fs = require('fs');
const path = require('path');

const chatPath = path.join(__dirname, '_chat.txt');
const chat = fs.readFileSync(chatPath, 'utf-8');

const lines = chat.split('\n').filter(Boolean);

// Basis-Statistiken
const stats = {};
const hours = {};
const emojis = {};
const words = {};
const yearStats = {};
const imageStats = {}; // Neue Bild-Statistiken
let total = 0;
let totalImages = 0;

// Emoji-Regex
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

// Wörter die gefiltert werden sollen (Medien, System-Nachrichten, etc.)
const filterWords = [
  'omitted', 'image', 'sticker', 'audio', 'video', 'document', 'contact', 'location',
  'deleted', 'message', 'was', 'sent', 'received', 'forwarded', 'you', 'missed', 'call'
];

// Funktion um zu prüfen ob eine Nachricht ein Bild ist
function isImageMessage(message) {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('image') || lowerMessage.includes('omitted');
}
const emojiBlacklist = ['🏻', '🏼', '🏽', '🏾', '🏿'];
for (const line of lines) {
  const match = line.match(/\[(\d{2})\.(\d{2})\.(\d{2}), (\d{2}):(\d{2}):(\d{2})\] (.*?): (.*)/);
  if (match) {
    const day = match[1];
    const month = match[2];
    const year = '20' + match[3];
    const hour = match[4];
    const name = match[7];
    const message = match[8];
    
    // Basis-Stats
    stats[name] = (stats[name] || 0) + 1;
    hours[hour] = (hours[hour] || 0) + 1;
    total++;
    
    // Bild-Statistiken
    if (isImageMessage(message)) {
      imageStats[name] = (imageStats[name] || 0) + 1;
      totalImages++;
    }
    
    // Jahresvergleich
    if (!yearStats[year]) yearStats[year] = { total: 0, byPerson: {} };
    yearStats[year].total++;
    yearStats[year].byPerson[name] = (yearStats[year].byPerson[name] || 0) + 1;
    
    // Emojis
    const foundEmojis = message.match(emojiRegex);
    if (foundEmojis) {
        foundEmojis.forEach(emoji => {
            if (!emojiBlacklist.includes(emoji)) {
            emojis[emoji] = (emojis[emoji] || 0) + 1;
            }
        });
    }
    
    // Wörter (gefiltert)
    const cleanMessage = message.replace(/[^\w\s]/g, '').toLowerCase();
    const messageWords = cleanMessage.split(/\s+/).filter(word => 
      word.length > 2 && 
      !filterWords.includes(word) &&
      !word.match(/^\d+$/) // Keine reinen Zahlen
    );
    messageWords.forEach(word => {
      words[word] = (words[word] || 0) + 1;
    });
  }
}

// Top-Emojis
const topEmojis = Object.entries(emojis).sort((a, b) => b[1] - a[1]).slice(0, 10);
const topWords = Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 20);

console.log('=== ERWEITERTE WHATSAPP-ANALYSE ===');
console.log('Gesamte Nachrichten:', total);
console.log('Top-Sender:', Object.entries(stats).sort((a, b) => b[1] - a[1])[0]);
console.log('Aktivste Uhrzeit:', Object.entries(hours).sort((a, b) => b[1] - a[1])[0]);

console.log('\n=== BILD-ANALYSE ===');
console.log('Gesamte Bilder:', totalImages);
Object.entries(imageStats).forEach(([person, count]) => {
  const percentage = ((count / totalImages) * 100).toFixed(1);
  console.log(`${person}: ${count} Bilder (${percentage}%)`);
});

console.log('\n=== TOP EMOJIS ===');
topEmojis.forEach((emoji, i) => console.log(`${i+1}. ${emoji[0]} (${emoji[1]}x)`));
console.log('\n=== TOP WÖRTER (gefiltert) ===');
topWords.forEach((word, i) => console.log(`${i+1}. "${word[0]}" (${word[1]}x)`));
console.log('\n=== JAHRESVERGLEICH ===');
Object.entries(yearStats).forEach(([year, data]) => {
  console.log(`${year}: ${data.total} Nachrichten`);
  Object.entries(data.byPerson).forEach(([person, count]) => {
    console.log(`  ${person}: ${count} Nachrichten`);
  });
});