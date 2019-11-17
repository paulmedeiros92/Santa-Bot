const canned = {
  generalHow: `Ho Ho HoooOOOoOOOO, here's a list of the things I can do:\n
  \thow: mention Santa Bot and the word how\n
  \t~~~list: mention Santa Bot and the word list and see his list~~~\n
  \tnaughty: mention Santa Bot and someone you feel is naughty\n
  \tnice: mention Santa Bot and someone you feel is nice\n`,
  privateHow: '',
  buildLeaderboard: (rows) => {
    let msg = 'Here is the list so far:\n';
    rows.forEach(({ username, karma }) => {
      msg += `\t${username} has ${karma}\n`;
    });
    return msg;
  },
};

module.exports = canned;
