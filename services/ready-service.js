import { addRemoveRole } from "./message-service.js";
import { roles } from "../constants.js";
import { getMembers } from "./api-service.js";

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
