const sqlite = require('./sqlite');
const log4js = require('./logger');

const {
  dbPath, channels, roles, emojis,
} = require('./constants');

const logger = log4js.buildLogger();

function createEmojis(guild) {
  Object.keys(emojis).forEach((roleName) => {
    const specificRole = guild.roles.cache.find((role) => role.name.toLowerCase() === roleName);
    if (specificRole) {
      emojis[roleName].forEach((emojiConfig) => {
        if (!guild.emojis.cache.find((emoji) => emoji.name.toLowerCase() === emojiConfig.name)) {
          const options = {
            roles: [specificRole],
            reason: 'Emoji creation on bot start up.',
          };
          guild.emojis.create(emojiConfig.attachment, emojiConfig.name, options)
            .catch((error) => logger.error(error));
        }
      });
    } else {
      logger.error(`Could not find "${roleName}" role`);
    }
  });
}

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
      .then(() => {
        createChannels(guild);
        createEmojis(guild);
      })
      .catch((error) => {
        logger.error(error);
      });
  });
  sqlite.openDB(dbPath).then(() => {
    sqlite.buildGuildTables(guilds);
  });
};
