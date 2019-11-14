const sqlite = require('./sqlite');

const BOTID = '643605290842849310';
let KARMA;

function sendMsg(msg, channel) {
  channel.send(msg);
}

function naughty() {
  KARMA = KARMA.map(({ id, username, karma }) => ({ id, username, karma: karma - 1 }));
}

function nice() {
  KARMA = KARMA.map(({ id, username, karma }) => ({ id, username, karma: karma + 1 }));
}

function updateScores(channel) {
  KARMA.forEach(({ id, username, karma }) => {
    sqlite.updateKarma(id, karma).then(() => {
      sendMsg(`Updated ${username}'s karma to ${karma}`, channel);
    });
  });
}

// TODO: errors if user does not exist/ invalid ignore reserved @ like everyone
exports.evaluateMsg = ({ channel, content, mentions }) => {
  const msg = content.toLowerCase();
  const { users } = mentions;
  // Remove Santa Bot ID then put ID's into array form
  users.delete(BOTID);
  const userIds = Array.from(users.values()).map((user) => user.id);

  sqlite.getUsers(userIds).then((scores) => {
    KARMA = scores;

    if (msg.includes('naughty')) {
      naughty(users, channel);
    } if (msg.includes('nice')) {
      nice(users, channel);
    }
    updateScores(channel);
  });
};
