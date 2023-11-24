const https = require("https");

const host = process.env.API_URL;

exports.buildUserBase = async (guild) => {
  const members = await guild.members.fetch();
  const discordUsers = members
    .filter((member) => !member.user.bot)
    .map(({ user }) => ({
      discordId: user.id,
      discordName: user.username,
      discordGuildId: guild.id,
    }));
  https.request(
    { host, path: "discord/user/create", method: "POST" },
    discordUsers
  );
};

exports.addPresent = (userId, priority, description) =>
  https.request(
    { host, path: `discord/user/${userId}/present`, method: "POST" },
    [{ priority, description }]
  );

exports.getUserPresents = (userId) =>
  https.get({ host, path: `discord/user/${userId}/present` });

exports.addMember = (guildId, user) =>
  https.request({ host, path: `discord/user`, method: "POST" }, [
    { discordId: user.id, discordName: user.username, discordGuildId: guildId },
  ]);

exports.getMembers = (guildId) =>
  https.get({ host, path: `discord/guildId/${guildId}/users` });

exports.updateMembers = (members) =>
  https.request(
    { host, path: `discord/user`, method: "PUT" },
    members.map(({ id, karma }) => ({ discordUserId: id, karma }))
  );
