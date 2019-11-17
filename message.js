const log4js = require('log4js');
const sqlite = require('./sqlite');
const canned = require('./canned-messages');

const BOTID = '643605290842849310';

log4js.configure({
  appenders: {
    console: { type: 'console' },
    activity: { type: 'file', filename: 'activity.log', category: 'activity' },
  },
  categories: {
    default: { appenders: ['console', 'activity'], level: 'trace' },
  },
});
const logger = log4js.getLogger('activity');


function sendMsg(msg, channel) {
  channel.send(msg);
}

function naughty(karmas) {
  return karmas.map(({ id, username, karma }) => ({ id, username, karma: karma - 1 }));
}

function nice(karmas) {
  return karmas.map(({ id, username, karma }) => ({ id, username, karma: karma + 1 }));
}

function list(channel) {
  sqlite.getAllUsers(channel).then((rows) => {
    // for each row get presents promise all then print message/
    Promise.all(rows.map(({ id }) => sqlite.getPresents(id))).then((presents) => {
      sendMsg(canned.buildLeaderboard(rows, presents), channel);
    });
  });
}

function updateScores(karmas, channel) {
  karmas.forEach(({ id, username, karma }) => {
    sqlite.updateKarma(id, karma).then(() => {
      sendMsg(`Updated ${username}'s karma to ${karma}`, channel);
    });
  });
}

function want(userId, content, channel) {
  const props = content.slice(content.indexOf('[') + 1, content.indexOf(']')).split(',');
  sqlite.setPresent(userId, props[0], props[1]).then(() => {
    sendMsg(`I just saved [${props[0]}, ${props[1]}] to your list.`, channel);
  });
}

exports.evaluateMsg = ({
  channel, content, mentions, author,
}) => {
  const msg = content.toLowerCase();
  const { users } = mentions;
  users.delete(BOTID);
  const userIds = Array.from(users.values()).map((user) => parseInt(user.id, 10));

  // TODO: functionality to prevent collisions between how and the usage of other commands
  sqlite.getUsers(userIds).then((scores) => {
    let karmas = scores;
    if (users.has(author.id)) {
      karmas = naughty(karmas, [parseInt(author.id, 10)]);
    } else {
      if (msg.includes('how')) {
        sendMsg(canned.generalHow, channel);
      } if (msg.includes('naughty')) {
        karmas = naughty(karmas, users, channel);
      } if (msg.includes('nice')) {
        karmas = nice(karmas, users, channel);
      } if (msg.includes('list')) {
        list(channel);
      }
    }
    updateScores(karmas, channel);
  });
};

exports.evaluateDM = ({ author, content, channel }) => {
  const msg = content.toLowerCase();
  if (msg.includes('how')) {
    sendMsg(canned.privateHow, channel);
  } if (msg.includes('want')) {
    want(parseInt(author.id, 10), content, channel);
  }
};
