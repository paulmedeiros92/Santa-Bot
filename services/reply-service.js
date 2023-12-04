import { EmbedBuilder, AttachmentBuilder } from "discord.js";

export function buildLeaderboard(rows) {
  const treeFile = new AttachmentBuilder("Embed Images/tree.png");
  const garlandFile = new AttachmentBuilder("Embed Images/garland.png");
  const embeds = [
    new EmbedBuilder()
      .setColor("#02731e")
      .setTitle("LEADERBOARD")
      .setThumbnail("attachment://tree.png")
      .setImage("attachment://garland.png"),
  ];

  let embedIndex = 0;
  rows.forEach(({ discordName, karma }, index) => {
    const position = index + 1;
    if (index % 25 === 0) {
      if (index / 25 >= 1) {
        embeds.push(
          new EmbedBuilder()
            .setColor("#02731e")
            .setTitle("LEADERBOARD")
            .setThumbnail("attachment://tree.png")
            .setImage("attachment://garland.png")
        );
        embedIndex++;
      }
      embeds[embedIndex].addFields({
        name: `#${position} ${discordName}`,
        value: `karma: ${karma}`,
      });
    } else {
      embeds[embedIndex].addFields({
        name: `#${position} ${discordName}`,
        value: `karma: ${karma}`,
      });
    }
  });

  return { embeds, files: [treeFile, garlandFile] };
}

export function buildUserPresentList(presents, displayName, present = false) {
  const garlandFile = new AttachmentBuilder("Embed Images/garland.png");
  const coalFile = new AttachmentBuilder("Embed Images/coal.png");
  const treeFile = new AttachmentBuilder("Embed Images/tree.png");
  const files = [garlandFile];
  const embedMsg = new EmbedBuilder()
    .setColor("#02731e")
    .setTitle(`${displayName}'s List`)
    .setThumbnail("attachment://tree.png")
    .setImage("attachment://garland.png");

  if (presents.length === 0) {
    embedMsg
      .setDescription("Doesn't believe in Santa")
      .setThumbnail("attachment://coal.png");
    files.push(coalFile);
  } else {
    embedMsg.setThumbnail("attachment://tree.png");
    files.push(treeFile);

    if (present) {
      embedMsg.setDescription(
        `Added ${present.description} to rank #${present.priority}`
      );
    }

    const fields = presents.map(({ priority, description }) => ({
      name: `#${priority}`,
      value: description,
    }));
    embedMsg.addFields(...fields);
  }

  return { embeds: [embedMsg], files };
}

export function buildSantasPresentList(presents) {
  const treeFile = new AttachmentBuilder("Embed Images/tree.png");
  const garlandFile = new AttachmentBuilder("Embed Images/garland.png");
  const embedMsg = new EmbedBuilder()
    .setColor("#02731e")
    .setTitle("Santa's List")
    .setThumbnail("attachment://tree.png")
    .setImage("attachment://garland.png");

  const users = new Map();
  presents.forEach((present) => {
    const oldPresents = users.get(present.discordName);
    if (oldPresents) {
      users.set(present.discordName, [
        present,
        ...users.get(present.discordName),
      ]);
    } else {
      users.set(present.discordName, [present]);
    }
  });
  users.forEach((listItems, discordName) => {
    let value = "";
    listItems.sort(
      (presentA, presentB) => presentA.priority - presentB.priority
    );
    if (listItems.length > 0) {
      value += listItems
        .map((present) => `#${present.priority} ${present.description}`)
        .join("\n");
    } else {
      value += " doesn't believe in Santa Bot.";
    }
    embedMsg.addFields({ name: `${discordName}'s list:`, value });
  });

  return { embeds: [embedMsg], files: [treeFile, garlandFile] };
}
