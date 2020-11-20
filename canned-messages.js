const canned = {
  generalHow: `Ho! Ho!! Ho!!! Merry X-Mas! What can I help you with?\n
  **naughty**: Mention someone you feel is naughty
  \t\tex) \`@Jack is naughty\`
  **nice**: Mention someone you feel is nice
  \t\tex) \`@Rudolph is nice\`
  **list**: Mention Santa Bot and the word list to see the leader board.
  \t\tex) \`@Santa Claus may I please see your list?\``,
  privateHow: `\`\`\`Ho Ho HoooOOOoOOOO, here's a list of the things I can do:\n
  \twant: ask for a present you want, you only get 5 though\n
  \t\t\tDescription -\t[(text description),(ranking 1-5)]\n
  \t\t\tExample -\t\tI want a [Pony, 3] [Gundam, 1]\n
  \`\`\``,
  buildLeaderboard: (rows, presents) => {
    let msg = '```Here is the list so far:\n';
    for (let i = 0; i < rows.length; i += 1) {
      msg += `\t${rows[i].username} has ${rows[i].karma} karma`;
      if (presents[i].length > 0) {
        msg += ', and wants: ';
        msg += presents[i].map((present) => present.desc).join(', ');
        msg += '\n';
      } else {
        msg += '\n';
      }
    }
    msg += '```';
    return msg;
  },
};

module.exports = canned;
