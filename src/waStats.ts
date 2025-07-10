import * as fs from 'fs';
import * as path from 'path';

// Pfad zur Chatdatei
const chatPath = path.join(__dirname, '../_chat.txt');
const chat = fs.readFileSync(chatPath, 'utf-8');

const lines = chat.split('\n').filter(Boolean);

const stats: Record<string, number> = {};
const hours: Record<string, number> = {};
let total = 0;

for (const line of lines) {
  // Beispiel: [28.06.22, 08:50:04] Silas Beckmann: was hast du
  const match = line.match(/\[(\d{2})\.(\d{2})\.(\d{2}), (\d{2}):(\d{2}):(\d{2})\] (.*?):/);
  if (match) {
    const hour = match[4];
    const name = match[7];
    stats[name] = (stats[name] || 0) + 1;
    hours[hour] = (hours[hour] || 0) + 1;
    total++;
  }
}

// Top-Sender
const topSender = Object.entries(stats).sort((a, b) => b[1] - a[1])[0];
// Aktivste Stunde
const topHour = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];

console.log('Gesamte Nachrichten:', total);
console.log('Top-Sender:', topSender[0], `(${topSender[1]} Nachrichten)`);
console.log('Aktivste Uhrzeit:', topHour[0] + ' Uhr', `(${topHour[1]} Nachrichten)`);