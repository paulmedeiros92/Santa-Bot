const Discord = require('discord.js');

exports.buildLeaderboard = (rows) => {
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
};

exports.buildUserPresentList = (presents, username, present = false) => {
  const treeFile = new Discord.MessageAttachment('Embed Images/tree.png');
  const garlandFile = new Discord.MessageAttachment('Embed Images/garland.png');
  const embedMsg = new Discord.MessageEmbed()
    .setColor('#02731e')
    .setTitle(`${username}'s List`)
    .setThumbnail('attachment://tree.png')
    .setImage('attachment://garland.png');

  if (present) {
    embedMsg.setDescription(`Added ${present.description} to rank #${present.rank}`);
  } if (presents.length === 0) {
    embedMsg.addField('Doesn\'t believe in Santa');
  } else {
    presents.forEach(({ rank, description }) => {
      embedMsg.addField(`#${rank}`, description, false);
    });
  }
  return { embeds: [embedMsg], files: [treeFile, garlandFile] };
};

exports.buildSantasPresentList = (presents) => {
  const treeFile = new Discord.MessageAttachment('Embed Images/tree.png');
  const garlandFile = new Discord.MessageAttachment('Embed Images/garland.png');
  const embedMsg = new Discord.MessageEmbed()
    .setColor('#02731e')
    .setTitle('Santa\'s List')
    .setThumbnail('attachment://tree.png')
    .setImage('attachment://garland.png');

  const users = new Map();
  presents.forEach((present) => {
    const oldPresents = users.get(present.username);
    if (oldPresents) {
      users.set(present.username, [present, ...users.get(present.username)]);
    } else {
      users.set(present.username, [present]);
    }
  });
  users.forEach((listItems, username) => {
    let content = '';
    if (listItems.length > 0) {
      content += listItems.map((present) => `"${present.description}"`).join(', ');
    } else {
      content += ' doesn\'t believe in Santa Bot.';
    }
    embedMsg.addField(`${username}'s list:`, content, false);
  });

  return { embeds: [embedMsg], files: [treeFile, garlandFile] };
};
