const canned = {
  generalHow: `Ho! Ho!! Ho!!! Merry X-Mas! What can I help you with?\n
  **naughty**: Mention someone you feel is naughty.
  \t\tex) \`@Jack is naughty.\`
  **nice**: Mention someone you feel is nice.
  \t\tex) \`@Rudolph is nice.\`
  **karma**: Mention Santa Bot and the word karma to see the leader board.
  \t\tex) \`@Santa Claus I wonder what my karma is like.\`
  **present**: Mention Santa Bot and the word present to see everyone's wish list.
  \t\tex) \`@Santa Claus what presents are you tracking?\``,
  privateHow: `Ho! Ho!! Ho!!! Merry X-Mas! What can I help you with?\n
  **want**: ask for a present you want, you only get 5 though
  \t__Description__ ~ [(text description), (ranking 1-5)]
  \t\tex) \`I want a [Pony, 3] [Gundam, 1]\``,
  buildLeaderboard: (rows) => {
    let msg = '**LEADERBOARD:**';

    for (let i = 0; i < rows.length; i += 1) {
      if (i === 0) {
        msg += `\`\`\`diff\n+1 ${rows[i].username}: ${rows[i].karma} karma\n\`\`\``;
      } else if (i === 1) {
        msg += `\`\`\`glsl\n#2 ${rows[i].username}: ${rows[i].karma} karma\n\`\`\``;
      } else if (i === 2) {
        msg += `\`\`\`diff\n-3 ${rows[i].username}: ${rows[i].karma} karma\n\`\`\``;
      } else if (i === 3) {
        msg += `\`\`\`#4 ${rows[i].username}: ${rows[i].karma} karma\n`;
      } else {
        msg += `#${i + 1} ${rows[i].username}: ${rows[i].karma} karma\n`;
      }
    }
    msg += '```';
    return msg;
  },
  buildPresents: (users, presents) => {
    let msg = '**SANTA BOT\'S LIST:**\n\n';
    users.forEach((user, i) => {
      msg += `**${user.username}**`;
      if (presents[i].length > 0) {
        msg += ' wants: \n';
        msg += presents[i].map((present) => `"${present.desc}"`).join(', ');
        msg += '\n\n';
      } else {
        msg += ' doesn\'t believe in Santa Bot.\n\n';
      }
    });
    return msg;
  },
};

module.exports = canned;
