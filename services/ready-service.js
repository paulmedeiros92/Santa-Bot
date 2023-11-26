import { addRemoveRole } from "./message-service.js";
import logger from "../logger.js";

import { roles, emojis } from "../constants.js";
import { getMembers } from "./api-service.js";

export async function createEmojis(guild) {
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
}

export function createRoles(guild) {
  const createdRoles = [];
  roles.forEach((roleConfig) => {
    if (!guild.roles.cache.find((role) => role.name === roleConfig.name)) {
      createdRoles.push(guild.roles.create(roleConfig));
    }
  });
  return createdRoles;
}

export async function evaluateAllUserRoles(guild) {
  const users = await getMembers(guild.id);
  return Promise.all(
    users.map(({ discordId, karma }) => addRemoveRole(discordId, guild, karma))
  );
}
