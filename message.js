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

function punish(channel) {
  // TODO: check if user can afford skill
  // TODO: get target user karma
  // TODO: perform action and adjust karma of source and target
  sendMsg('UNDER DEVELOPMENT!!!', channel);
}

function who(channel) {
  // TODO: who is in range of source users skills
  sendMsg('UNDER DEVELOPMENT!!!', channel);
}

function list(tableName, channel) {
  sqlite.getAllUsers(tableName, channel).then((rows) => {
    sendMsg(canned.buildLeaderboard(rows), channel);
  });
  // TODO: display karma scores within said range
}

function updateScores(tableName, karmas, channel) {
  karmas.forEach(({ id, username, karma }) => {
    sqlite.updateKarma(tableName, id, karma).then(() => {
      sendMsg(`Updated ${username}'s karma to ${karma}`, channel);
    });
  });
}

exports.evaluateMsg = ({
  channel, content, guild, mentions, author,
}) => {
  const authorID = parseInt(author.id, 10);
  const tableName = guild.name.toLowerCase().replace(' ', '') + guild.id;
  const msg = content.toLowerCase();
  const { users } = mentions;
  users.delete(BOTID);
  const userIds = Array.from(users.values()).map((user) => parseInt(user.id, 10));

  // TODO: functionality to prevent collisions between how and the usage of other commands
  sqlite.getUsers(tableName, userIds).then((scores) => {
    let karmas = scores;
    if (users.has(author.id)) {
      karmas = naughty(karmas, [authorID]);
    } else {
      if (msg.includes('how')) {
        sendMsg(canned.generalHow, channel);
      } if (msg.includes('naughty')) {
        karmas = naughty(karmas, users, channel);
      } if (msg.includes('nice')) {
        karmas = nice(karmas, users, channel);
      } if (msg.includes('list')) {
        list(tableName, channel);
      }
    }
    updateScores(tableName, karmas, channel);
  });
};

exports.evaluateDM = ({ author, channel, content }) => {
  const tableName = channel.name.toLowerCase().replace(' ', '') + channel.id;
  const msg = content.toLowerCase();
  sqlite.getUsers([author.id]).then((scores) => {
    const karma = scores;
    if (msg.includes('how')) {
      sendMsg(channel);
    } if (msg.includes('punish')) {
      punish(channel);
    } if (msg.includes('who')) {
      who(channel);
    } if (msg.includes('list')) {
      list(channel);
    }
  });
};
