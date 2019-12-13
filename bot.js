const Discord = require('discord.js');
const log4js = require('log4js');

const sqlite = require('./sqlite');
const msg = require('./message');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    activity: { type: 'file', filename: 'activity.log', category: 'activity' },
  },
  categories: {
    default: { appenders: ['console', 'activity'], level: 'trace' },
  },
});
const logger = log4js.getLogger('activity');
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
  if (receivedMessage.author !== client.user && receivedMessage.channel.type === 'dm') {
    logger.info(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}, message: "${receivedMessage.content}"`);
    msg.evaluateDM(receivedMessage);
  } else if (receivedMessage.author !== client.user
    && receivedMessage.content.includes(client.user.id)) {
    logger.info(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}, message: "${receivedMessage.content}"`);
    msg.evaluateMsg(receivedMessage);
  }
});
