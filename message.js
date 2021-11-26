const sqlite = require('./sqlite');
const canned = require('./canned-messages');
const log4js = require('./logger');
const { getMembers, updateMembers } = require('./fire-store');
const { BOTID, BOTID2 } = require('./constants');

const logger = log4js.buildLogger();

function sendMsg(msg, channel) {
  channel.send(msg);
}

async function addRemoveRole(userId, isNice, isNaughty, guild) {
  const roles = guild.roles.cache;
  const naughtyRole = roles.find((role) => role.name === 'Naughty');
  const niceRole = roles.find((role) => role.name === 'Nice');
  const ninjaRole = roles.find((role) => role.name === 'Ninja');
  const memberRoles = guild.members.cache.find((guildMember) => guildMember.id === userId).roles;
  if (isNice) {
    let modifiedMember = await memberRoles.add(niceRole);
    logger.info(`"Nice" role added to: ${modifiedMember.user.username}`);
    modifiedMember = await memberRoles.remove([naughtyRole, ninjaRole]);
    logger.info(`"Naughty" and "Ninja" roles removed from: ${modifiedMember.user.username}`);
  } else if (isNaughty) {
    let modifiedMember = await memberRoles.add(naughtyRole);
    logger.info(`"Naughty" role added to: ${modifiedMember.user.username}`);
    modifiedMember = await memberRoles.remove([niceRole, ninjaRole]);
    logger.info(`"Nice" and "Ninja" roles removed from: ${modifiedMember.user.username}`);
  } else {
    let modifiedMember = await memberRoles.add(ninjaRole);
    logger.info(`"Ninja" role added to: ${modifiedMember.user.username}`);
    modifiedMember = await memberRoles.remove([niceRole, naughtyRole]);
    logger.info(`"Naughty" and "Nice" roles removed from: ${modifiedMember.user.username}`);
  }
}

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

exports.updateScores = (karmas, users, guild, channel) => {
  karmas.forEach(({ id, username, karma }) => {
    sqlite.updateKarma(id, karma).then(() => {
      addRemoveRole(id, karma > 0, karma < 0, guild);
      if (channel != null) {
        sendMsg(`Updated ${username}'s karma to ${karma}`, channel);
      }
    });
  });
};

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

exports.evaluateMsg = ({
  channel, content, mentions, author, guild,
}) => {
  const msg = content.toLowerCase();
  const { users } = mentions;
  users.delete(BOTID);
  users.delete(BOTID2);
  const userIds = Array.from(users.values()).map((user) => user.id);

  // TODO: functionality to prevent collisions between how and the usage of other commands
  getMembers(guild.id, userIds).then((members) => {
    let karmas = members;
    if (users.has(author.id)) {
      karmas = naughty(karmas, [author.id]);
    } else {
      if (msg.includes('naughty')) {
        karmas = naughty(karmas);
      } if (msg.includes('nice')) {
        karmas = nice(karmas);
      } if (msg.includes('present') && ['naughty', 'nice'].every((keyword) => !msg.includes(keyword))) {
        presentMessage(channel);
      } if (msg.includes('karma') && ['naughty', 'nice'].every((keyword) => !msg.includes(keyword))) {
        leaderboardMessage(channel);
      } if (['naughty', 'nice', 'present', 'karma'].every((keyword) => !msg.includes(keyword))) {
        sendMsg(canned.generalHow(), channel);
      }
    }
    this.updateScores(karmas, users, guild, channel);
  });
};

function modifyKarma(members, delta) {
  return members.map(({ id, username, karma }) => {
    if (karma) {
      return { id, username, karma: karma + delta };
    }
    return { id, username, karma: delta };
  });
}

function naughty(members) {
  return members.map(({ id, username, karma }) => ({ id, username, karma: karma - 1 }));
}

function nice(members) {
  return members.map(({ id, username, karma }) => ({ id, username, karma: karma + 1 }));
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
  let members = await getMembers(message.guildId, mentions);
  if (content.includes('naughty')) {
    members = modifyKarma(members, -1);
  } if (content.includes('nice')) {
    members = modifyKarma(members, 1);
  }
  // work on this
  members.forEach(
    (member) => addRemoveRole(member.id, member.karma > 0, member.karma < 0, message.guild),
  );
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
