const Discord = require('discord.js');
const log4js = require('./logger');

const msg = require('./message');
const guildSetup = require('./guild-setup');

const logger = log4js.buildLogger();
const args = process.argv.slice(2);

const client = new Discord.Client();
client.login(args[0]);

client.on('ready', () => {
  const guildManager = client.guilds;
  Promise.all(client.guilds.cache.map((guild) => guildManager.fetch(guild.id)))
    .then((guilds) => {
      guildSetup.init(guilds);
    })
    .catch((error) => {
      logger.error(error);
    });
});

client.on('message', (receivedMessage) => {
  if (receivedMessage.author !== client.user && receivedMessage.channel.type === 'dm') {
    logger.info(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}, message: "${receivedMessage.content}"`);
    msg.evaluateDM(receivedMessage);
  } else if (receivedMessage.author !== client.user
    && (receivedMessage.content.includes(client.user.id) || ['naughty', 'nice'].some((keyword) => receivedMessage.content.includes(keyword)))
  ) {
    logger.info(`This is ${receivedMessage.author.username}'s id: ${receivedMessage.author.id}, message: "${receivedMessage.content}"`);
    msg.evaluateMsg(receivedMessage);
  }
});
