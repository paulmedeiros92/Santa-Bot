const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { discord } = require('./config.json');

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  ],
});

// Attach commands to client, so I can access the commands from other contexts
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
commandFiles.forEach((file) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
});

const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));
eventFiles.forEach((file) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

client.login(discord.token);
