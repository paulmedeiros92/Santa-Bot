const sqlite = require('./sqlite');
const canned = require('./canned-messages');
const log4js = require('./logger');
const { BOTID, BOTID2 } = require('./constants');

const logger = log4js.buildLogger();

function sendMsg(msg, channel) {
  channel.send(msg);
}

function addRemoveRole(users, isNice, isNaughty, guild) {
  const roles = guild.roles.cache;
  const naughtyRole = roles.find((role) => role.name === 'Naughty');
  const niceRole = roles.find((role) => role.name === 'Nice');
  const ninjaRole = roles.find((role) => role.name === 'Ninja');
  users.forEach(async (user) => {
    const memberRoles = guild.members.cache.find((guildMember) => guildMember.id === user.id).roles;
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
  });
}

function naughty(karmas) {
  return karmas.map(({ id, username, karma }) => ({ id, username, karma: karma - 1 }));
}

function nice(karmas) {
  return karmas.map(({ id, username, karma }) => ({ id, username, karma: karma + 1 }));
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

function updateScores(karmas, channel, users, guild) {
  karmas.forEach(({ id, username, karma }) => {
    sqlite.updateKarma(id, karma).then(() => {
      addRemoveRole(users, karma > 0, karma < 0, guild);
      sendMsg(`Updated ${username}'s karma to ${karma}`, channel);
    });
  });
}

function openPresent(present) {
  return present.slice(present.indexOf('[') + 1).split(',');
}

function want(userId, content, channel) {
  const presents = content.split(']').filter((raw) => raw.includes('[')).map((present) => openPresent(present));
  sqlite.setPresents(userId, presents).then(() => {
    let msg = 'I just saved ';
    presents.forEach((present) => {
      msg += `[${present[0]}, ${present[1]}] `;
    });
    msg += 'to your list.';
    sendMsg(msg, channel);
  });
}

exports.evaluateMsg = ({
  channel, content, mentions, author, guild,
}) => {
  const msg = content.toLowerCase();
  const { users } = mentions;
  users.delete(BOTID);
  users.delete(BOTID2);
  const userIds = Array.from(users.values()).map((user) => parseInt(user.id, 10));

  // TODO: functionality to prevent collisions between how and the usage of other commands
  sqlite.getUsersById(userIds).then((scores) => {
    let karmas = scores;
    if (users.has(author.id)) {
      karmas = naughty(karmas, [parseInt(author.id, 10)]);
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
        sendMsg(canned.generalHow, channel);
      }
    }
    updateScores(karmas, channel, users, guild);
  });
};

exports.evaluateDM = ({ author, content, channel }) => {
  const msg = content.toLowerCase();
  if (msg.includes('want')) {
    want(parseInt(author.id, 10), content, channel);
  } if (['want'].every((keyword) => !msg.includes(keyword))) {
    sendMsg(canned.privateHow, channel);
  }
};
