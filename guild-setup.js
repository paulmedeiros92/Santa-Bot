const sqlite = require('./sqlite');
const message = require('./message');
const log4js = require('./logger');

const {
  dbPath, channels, roles, emojis, botRole,
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
          (role) => role.name === botRole,
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

function evaluateAllUsers(guild) {
  const memberIds = guild.members.cache.map((member) => member.id);
  sqlite.getUsersById(memberIds)
    .then((users) => {
      message.updateScores(users, users, guild);
    });
}

exports.init = (guilds) => {
  sqlite.openDB(dbPath)
    .then(() => {
      sqlite.buildGuildTables(guilds)
        .then(() => {
          guilds.forEach((guild) => {
            Promise.all(createRoles(guild))
              .then(() => {
                createChannels(guild);
                createEmojis(guild);
                evaluateAllUsers(guild);
              })
              .catch((error) => {
                logger.error(`Roles could not be create: ${error}`);
              });
          });
        })
        .catch((error) => logger.error(`Tables could not be built onInit: ${error}`));
    })
    .catch((error) => logger.error(`Database could not be open: ${error}`));
};
