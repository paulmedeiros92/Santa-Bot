const sqlite = require('./sqlite');
const canned = require('./canned-messages');
const log4js = require('./logger');
const { getMembers, updateMembers } = require('./fire-store');

const logger = log4js.buildLogger();

function sendMsg(msg, channel) {
  channel.send(msg);
}

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

function presentMessage(channel) {
  sqlite.getAllUsers(channel)
    .then((rows) => {
      // for each row get presents promise all then print message/
      Promise.all(rows.map(({ id }) => sqlite.getPresents(id)))
        .then((presents) => {
          sendMsg(canned.buildPresents(rows, presents), channel);
        })
        .catch((rejection) => {
          logger.error(rejection);
        });
    })
    .catch((rejection) => logger.error(rejection));
}

function leaderboardMessage(channel) {
  sqlite.getAllUsers(channel)
    .then((users) => {
      sendMsg(canned.buildLeaderboard(users), channel);
    })
    .catch((error) => logger.error(error));
}

function openPresent(present) {
  const contents = present.slice(present.indexOf('[') + 1).split('|');
  contents[1] = parseInt(contents[1], 10);
  return contents;
}

function want(userId, content, channel) {
  const presents = content.match(/\[[^\|\]]+\|\s*[1-5]\s*\]/g);
  if (presents !== null) {
    const presentContents = presents.map((present) => openPresent(present));
    sqlite.setPresents(userId, presentContents)
      .then(() => {
        let msg = 'I just saved ';
        presentContents.forEach((present) => {
          msg += `[${present[0]}, ${present[1]}] `;
        });
        msg += 'to your list.';
        sendMsg(msg, channel);
      })
      .catch(() => {
        sendMsg(`Your present could not be saved T__T: ${content}`, channel);
      });
  } else {
    sendMsg('No valid presents were found in your message.', channel);
  }
}

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

exports.evaluateDM = ({ author, content, channel }) => {
  const msg = content.toLowerCase();
  if (msg.includes('want')) {
    want(author.id, content, channel);
  } else if (msg.includes('present')) {
    presentMessage(channel);
  } else if (msg.includes('karma')) {
    leaderboardMessage(channel);
  } else {
    sendMsg(canned.privateHow(), channel);
  }
};
