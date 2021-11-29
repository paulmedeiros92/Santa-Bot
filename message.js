const log4js = require('./logger');
const { getMembers, updateMembers } = require('./fire-store');

const logger = log4js.buildLogger();

exports.addRemoveRole = async (userId, guild, karma = 0) => {
  const roles = guild.roles.cache.filter((role) => ['Naughty', 'Nice', 'Ninja'].includes(role.name));
  const memberRoles = guild.members.cache.find((guildMember) => guildMember.id === userId).roles;
  let currentRole;
  if (karma > 0) {
    currentRole = roles.find((role) => role.name === 'Nice');
  } else if (karma < 0) {
    currentRole = roles.find((role) => role.name === 'Naughty');
  } else {
    currentRole = roles.find((role) => role.name === 'Ninja');
  }
  let modifiedMember = await memberRoles.add(currentRole);
  logger.info(`${currentRole.name} role added to: ${modifiedMember.user.username}`);
  const rolesToRemove = roles.filter((role) => role.name !== currentRole.name);
  modifiedMember = await memberRoles.remove(rolesToRemove);
  logger.info(`${rolesToRemove.map((role) => role.name).join(' and ')} roles removed from: ${modifiedMember.user.username}`);
};

function modifyKarma(members, delta) {
  return members.map(({ id, username, karma }) => {
    if (karma) {
      return { id, username, karma: karma + delta };
    }
    return { id, username, karma: delta };
  });
}

function cleanMentions(senderId, mentions) {
  return mentions.users.filter((user) => !user.bot && user.id !== senderId);
}

exports.parseKarmaMessage = async (message) => {
  const content = message.content.toLowerCase();
  if (!(content.includes('naughty') || content.includes('nice'))) {
    return [];
  }

  const mentions = cleanMentions(message.author.id, message.mentions);
  let members = await getMembers(message.guildId, Array.from(mentions.keys()));
  if (content.includes('naughty')) {
    members = modifyKarma(members, -1);
  } if (content.includes('nice')) {
    members = modifyKarma(members, 1);
  }
  for (let i = 0; i < members.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await this.addRemoveRole(members[i].id, message.guild, members[i].karma);
  }
  await updateMembers(message.guildId, members);
  return members;
};
