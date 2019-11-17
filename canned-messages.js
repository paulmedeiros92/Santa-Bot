const canned = {
  generalHow: `\`\`\`Ho Ho HoooOOOoOOOO, here's a list of the things I can do:\n
  \thow: mention Santa Bot and the word how\n
  \tlist: mention Santa Bot and the word list and see his list\n
  \tnaughty: mention Santa Bot and someone you feel is naughty\n
  \tnice: mention Santa Bot and someone you feel is nice\n\`\`\``,
  privateHow: `\`\`\`Ho Ho HoooOOOoOOOO, here's a list of the things I can do:\n
  \twant: ask for a present you want, you only get 5 though\n
  \t\t\tDescription -\t[(text description),(ranking 1-5)]\n
  \t\t\tExample -\t\tI want a [Pony, 3]\n
  \`\`\``,
  buildLeaderboard: (rows, presents) => {
    let msg = '```Here is the list so far:\n';
    for (let i = 0; i < rows.length; i += 1) {
      msg += `\t${rows[i].username} has ${rows[i].karma}: and wants(`;
      msg += presents[i].map((present) => present.desc).join(',');
      msg += ')\n';
    }
    msg += '```';
    return msg;
  },
};

module.exports = canned;
