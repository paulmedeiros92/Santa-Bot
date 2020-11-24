const sqlite = require('./sqlite');
const canned = require('./canned-messages');
const log4js = require('./logger');
const { BOTID, BOTID2 } = require('./constants');

const logger = log4js.buildLogger;

function sendMsg(msg, channel) {
  channel.send(msg);
}

function addRemoveRole(users, isNice, isNaughty, guild) {
  const roles = guild.roles.cache;
  const naughtyRole = roles.find((role) => role.name === 'Naughty');
  const niceRole = roles.find((role) => role.name === 'Nice');
  const ninjaRole = roles.find((role) => role.name === 'Ninja');
  users.forEach((user) => {
    const memberRoles = guild.members.cache.find((guildMember) => guildMember.id === user.id).roles;
    if (isNice) {
      memberRoles.add(niceRole);
      memberRoles.remove([naughtyRole, ninjaRole]);
    } else if (isNaughty) {
      memberRoles.add(naughtyRole);
      memberRoles.remove([niceRole, ninjaRole]);
    } else {
      memberRoles.add(ninjaRole);
      memberRoles.remove([niceRole, naughtyRole]);
    }
  });
}

function naughty(karmas) {
  return karmas.map(({ id, username, karma }) => ({ id, username, karma: karma - 1 }));
}

function nice(karmas) {
  return karmas.map(({ id, username, karma }) => ({ id, username, karma: karma + 1 }));
}

function list(channel) {
  sqlite.getAllUsers(channel)
    .then((rows) => {
      // for each row get presents promise all then print message/
      Promise.all(rows.map(({ id }) => sqlite.getPresents(id)))
        .then((presents) => {
          sendMsg(canned.buildLeaderboard(rows, presents), channel);
        })
        .catch((rejection) => {
          logger.error(rejection);
        });
    })
    .catch((rejection) => {
      logger.error(rejection);
    });
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
      } if (msg.includes('list')) {
        list(channel);
      } if (['naughty', 'nice', 'list'].every((keyword) => !msg.includes(keyword))) {
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
  } if (msg.includes('list')) {
    list(channel);
  } if (['want', 'list'].every((keyword) => !msg.includes(keyword))) {
    sendMsg(canned.privateHow, channel);
  }
};
