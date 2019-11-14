const Discord = require('discord.js');
const sqlite = require('./sqlite');
const msg = require('./message');

const args = process.argv.slice(2);

const client = new Discord.Client();
client.login(args[0]);
const dbPath = '../SantaDB/SantaDB';

client.on('ready', () => {
  sqlite.openDB(dbPath).then(() => {
    sqlite.buildGuildTables(client.guilds);
  });
});

client.on('message', (receivedMessage) => {
  console.log(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}`);
  // Prevent bot from responding to its own messages
  if (receivedMessage.author !== client.user
    && receivedMessage.content.includes(client.user.toString())) {
    msg.evaluateMsg(receivedMessage);
  }
});
