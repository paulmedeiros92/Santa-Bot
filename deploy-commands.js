const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { discord } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
commandFiles.forEach((file) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
});

const rest = new REST({ version: '9' }).setToken(discord.token);
rest.put(Routes.applicationCommands(discord.clientId), { body: commands })
  .then(console.log('Successfully added global commands!'))
  .catch((error) => console.log(`Failed to add global commands: ${error}`));
