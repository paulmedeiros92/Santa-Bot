const sqlite = require('./sqlite');
const log4js = require('./logger');

const {
  dbPath, channels, roles,
} = require('./constants');

const logger = log4js.buildLogger();

function createChannels(guild) {
  const createdRoles = guild.roles.cache;
  const promises = [];
  channels.forEach((channelConfig) => {
    if (!guild.channels.cache.find(
      (channel) => channel.name.toLowerCase() === channelConfig.name.toLowerCase()
      && channel.type === channelConfig.options.type,
    )) {
      if (channelConfig.options.permissionOverwrites) {
        channelConfig.options.permissionOverwrites[0].id = createdRoles.find(
          (role) => role.name === '@everyone',
        ).id;
        channelConfig.options.permissionOverwrites[1].id = createdRoles.find(
          (role) => role.name === channelConfig.name,
        ).id;
        channelConfig.options.permissionOverwrites[2].id = createdRoles.find(
          (role) => role.name === 'Test Bot',
        ).id;
      }
      promises.push(guild.channels.create(channelConfig.name, channelConfig.options));
    }
  });
  Promise.all(promises)
    .then((createdChannels) => {
      createdChannels.forEach((createdChannel) => {
        if (createdChannel.type === 'text') {
          const parent = guild.channels.cache.find((channel) => channel.name === channels[0].name
            && channel.type === channels[0].options.type);
          createdChannel.setParent(parent, { lockPermissions: false })
            .catch((error) => {
              logger.error(error);
            });
        }
      });
    })
    .catch((error) => {
      logger.error(error);
    });
}

function createRoles(guild) {
  const createdRoles = [];
  roles.forEach((roleConfig) => {
    if (!guild.roles.cache.find((role) => role.name === roleConfig.data.name)) {
      createdRoles.push(guild.roles.create(roleConfig));
    }
  });
  return createdRoles;
}

exports.init = (guilds) => {
  guilds.forEach((guild) => {
    Promise.all(createRoles(guild))
      .then(() => createChannels(guild))
      .catch((error) => {
        logger.error(error);
      });
  });
  sqlite.openDB(dbPath).then(() => {
    sqlite.buildGuildTables(guilds);
  });
};
