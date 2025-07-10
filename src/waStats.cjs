"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// Pfad zur Chatdatei
var chatPath = path.join(__dirname, '../_chat.txt');
var chat = fs.readFileSync(chatPath, 'utf-8');
var lines = chat.split('\n').filter(Boolean);
var stats = {};
var hours = {};
var total = 0;
for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
    var line = lines_1[_i];
    // Beispiel: [28.06.22, 08:50:04] Silas Beckmann: was hast du
    var match = line.match(/\[(\d{2})\.(\d{2})\.(\d{2}), (\d{2}):(\d{2}):(\d{2})\] (.*?):/);
    if (match) {
        var hour = match[4];
        var name_1 = match[7];
        stats[name_1] = (stats[name_1] || 0) + 1;
        hours[hour] = (hours[hour] || 0) + 1;
        total++;
    }
}
// Top-Sender
var topSender = Object.entries(stats).sort(function (a, b) { return b[1] - a[1]; })[0];
// Aktivste Stunde
var topHour = Object.entries(hours).sort(function (a, b) { return b[1] - a[1]; })[0];
console.log('Gesamte Nachrichten:', total);
console.log('Top-Sender:', topSender[0], "(".concat(topSender[1], " Nachrichten)"));
console.log('Aktivste Uhrzeit:', topHour[0] + ' Uhr', "(".concat(topHour[1], " Nachrichten)"));
