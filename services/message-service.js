import logger from "../logger.js";
import { getMembers, updateMembers } from "./api-service.js";

function modifyKarma(members, delta = 0) {
  return members.map((member) => ({...member, karma: member.karma + delta}));
}

export async function addRemoveRole(userId, guild, karma = 0) {
  const roles = guild.roles.cache.filter((role) =>
    ["Naughty", "Nice", "Ninja"].includes(role.name)
  );
  const memberRoles = guild.members.cache.find(
    (guildMember) => guildMember.id === userId
  ).roles;
  let currentRole;
  if (karma > 0) {
    currentRole = roles.find((role) => role.name === "Nice");
  } else if (karma < 0) {
    currentRole = roles.find((role) => role.name === "Naughty");
  } else {
    currentRole = roles.find((role) => role.name === "Ninja");
  }
  let modifiedMember = await memberRoles.add(currentRole);
  logger.info(
    `${currentRole.name} role added to: ${modifiedMember.user.username}`
  );
  const rolesToRemove = roles.filter((role) => role.name !== currentRole.name);
  modifiedMember = await memberRoles.remove(rolesToRemove);
  logger.info(
    `${rolesToRemove
      .map((role) => role.name)
      .join(" and ")} roles removed from: ${modifiedMember.user.username}`
  );
};

export async function parseKarmaMessage(message) {
  const content = message.content.toLowerCase();
  if (!(content.includes("naughty") || content.includes("nice"))) {
    return [];
  }

  const mentions = message.mentions.users.filter(
    (user) => !user.bot && user.id !== message.author.id
  );
  let users = await getMembers(message.guildId, Array.from(mentions.keys()));
  if (content.includes("naughty")) {
    users = modifyKarma(users, -1);
  }
  if (content.includes("nice")) {
    users = modifyKarma(users, 1);
  }

  await Promise.all(users.map(({discordId, karma}) => addRemoveRole(discordId, message.guild, karma)));
  await updateMembers(message.guildId, users);
  return users;
};
