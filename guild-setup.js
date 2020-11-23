const { Guild } = require("discord.js")

const { channels, roles } = require('./constants');

function createChannels(guild) {
  channels.forEach((channel) => {
    guild.createChannel(channel.name, channel.options);
  });
}

function createRoles(guild) {
  roles.forEach((role) => {
    guild.roles.create(role);
  });
}

exports.init = (guilds) => {
  guilds.forEach((guild) => {
    createChannels(guild);
    createRoles(guild);
  });
};
