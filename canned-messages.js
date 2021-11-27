const Discord = require('discord.js');

const canned = {
  // generalHow: () => {
  //   const embedMsg = new Discord.MessageEmbed()
  //     .setColor('#0978ed')
  //     .setTitle('USAGE')
  //     .setDescription('Ho! Ho!! Ho!!! Merry X-Mas! What can I help you with?')
  //     .attachFiles(['Embed Images/tree.png', 'Embed Images/garland.png'])
  //     .setThumbnail('attachment://tree.png')
  //     .setImage('attachment://garland.png')
  //     .addFields(
  //       { name: 'naughty', value: 'Mention someone you feel is naughty.\nex) `@Jack is naughty.`' },
  //       { name: 'nice', value: 'Mention someone you feel is nice.\nex) `@Rudolph is nice.`' },
  //       { name: 'want', value: 'Ask for a present you want, you only get 5 though.\nex) `I want a [Pony| 3] [Gundam| 1]`' },
  //       { name: 'karma', value: 'Mention Santa Bot and the word karma to see the leader board.\nex) `@Santa Claus I wonder what my karma is like.`' },
  //       { name: 'present', value: 'Mention Santa Bot and the word present to see everyone\'s wish list.\nex) `@Santa Claus what presents are you tracking?`' },
  //     );
  //   return embedMsg;
  // },
  // privateHow: () => {
  //   const embedMsg = new Discord.MessageEmbed()
  //     .setColor('#edab05')
  //     .setTitle('USAGE')
  //     .setDescription('Ho! Ho!! Ho!!! Merry X-Mas! What can I help you with?')
  //     .attachFiles(['Embed Images/tree.png', 'Embed Images/garland.png'])
  //     .setThumbnail('attachment://tree.png')
  //     .setImage('attachment://garland.png')
  //     .addFields(
  //       { name: 'want', value: 'Ask for a present you want, you only get 5 though.\nex) `I want a [Pony| 3] [Gundam| 1]`' },
  //       { name: 'karma', value: 'Mention Santa Bot and the word karma to see the leader board.\nex) `@Santa Claus I wonder what my karma is like.`' },
  //       { name: 'present', value: 'Mention Santa Bot and the word present to see everyone\'s wish list.\nex) `@Santa Claus what presents are you tracking?`' },
  //     );
  //   return embedMsg;
  // },
  buildLeaderboard: (rows) => {
    const treeFile = new Discord.MessageAttachment('Embed Images/tree.png');
    const garlandFile = new Discord.MessageAttachment('Embed Images/garland.png');
    const embedMsg = new Discord.MessageEmbed()
      .setColor('#02731e')
      .setTitle('LEADERBOARD')
      .setThumbnail('attachment://tree.png')
      .setImage('attachment://garland.png');

    for (let i = 0; i < rows.length; i += 1) {
      const position = i + 1;
      if (position === 1) {
        embedMsg.addField(`#${position} ${rows[i].username}`, `${rows[i].karma} karma`, false);
      } else {
        embedMsg.addField(`#${position} ${rows[i].username}`, `${rows[i].karma} karma`, true);
      }
    }

    return { embeds: [embedMsg], files: [treeFile, garlandFile] };
  },
  buildPresents: (users, presents) => {
    const embedMsg = new Discord.MessageEmbed()
      .setColor('#02731e')
      .setTitle('SANTA\S LIST')
      .attachFiles(['Embed Images/tree.png', 'Embed Images/garland.png'])
      .setThumbnail('attachment://tree.png')
      .setImage('attachment://garland.png');

    users.forEach((user, i) => {
      let content = '';
      if (presents[i].length > 0) {
        content += presents[i].map((present) => `"${present.desc}"`).join(', ');
      } else {
        content += ' doesn\'t believe in Santa Bot.';
      }
      embedMsg.addField(`${user.username}'s list:`, content, false);
    });

    return embedMsg;
  },
};

module.exports = canned;
