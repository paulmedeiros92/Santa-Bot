const { addRemoveRole } = require("./message-service");
const log4js = require("../logger");

const { roles, emojis } = require("../constants");
const { getMembers } = require("./api-service");

const logger = log4js.buildLogger();

exports.createEmojis = async (guild) => {
  Object.keys(emojis).forEach((roleName) => {
    const specificRole = guild.roles.cache.find(
      (role) => role.name.toLowerCase() === roleName
    );
    if (specificRole) {
      emojis[roleName].forEach((emojiConfig) => {
        if (
          !guild.emojis.cache.find(
            (emoji) => emoji.name.toLowerCase() === emojiConfig.name
          )
        ) {
          const options = {
            roles: [specificRole],
            reason: "Emoji creation on bot start up.",
          };
          guild.emojis
            .create(emojiConfig.attachment, emojiConfig.name, options)
            .catch((error) => logger.error(error));
        }
      });
    } else {
      logger.error(`Could not find "${roleName}" role`);
    }
  });
};

exports.createRoles = (guild) => {
  const createdRoles = [];
  roles.forEach((roleConfig) => {
    if (!guild.roles.cache.find((role) => role.name === roleConfig.name)) {
      createdRoles.push(guild.roles.create(roleConfig));
    }
  });
  return createdRoles;
};

exports.evaluateAllUserRoles = async (guild) => {
  const members = await getMembers(guild.id);
  for (let i = 0; i < members.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await addRemoveRole(members[i].id, guild, members[i].karma);
  }
};
