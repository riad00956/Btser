
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const http = require('http');

// === CONFIGURATION ===
const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;
const port = process.env.PORT || 9000;
const bot = new TelegramBot(token, { polling: true });

// === LOAD SUBSCRIBERS ===
let subscribers = [];
try {
  subscribers = JSON.parse(fs.readFileSync('subscribers.json'));
} catch (e) {
  subscribers = [];
}

// === LOAD RESPONSES ===
let responses = {};
try {
  responses = JSON.parse(fs.readFileSync('responses.json'));
} catch (e) {
  responses = {};
}

// === SAVE SUBSCRIBERS ===
function saveSubscribers() {
  fs.writeFileSync('subscribers.json', JSON.stringify(subscribers, null, 2));
}

// === COMMAND: /start ===
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!subscribers.includes(chatId)) {
    subscribers.push(chatId);
    saveSubscribers();
  }
  bot.sendMessage(chatId, 'স্বাগতম! আপনি সফলভাবে AIR BOT HOSTING BOT-এ সাবস্ক্রাইব করেছেন।');
});

// === COMMAND: /newpost <message> (admin only) ===
bot.onText(/\/newpost (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const message = match[1];

  if (String(chatId) !== adminId) {
    return bot.sendMessage(chatId, 'আপনি এই কমান্ড ব্যবহারের অনুমতি পাননি।');
  }

  subscribers.forEach(id => {
    bot.sendMessage(id, `📢 নতুন বার্তা: ${message}`);
  });
});

// === DEFAULT RESPONSE BASED ON KEYWORDS ===
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  for (const keyword in responses) {
    if (text.includes(keyword.toLowerCase())) {
      bot.sendMessage(chatId, responses[keyword]);
      return;
    }
  }
});

// === START HTTP SERVER FOR RENDER (port) ===
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('AIR BOT HOSTING BOT is running!
');
}).listen(port);
