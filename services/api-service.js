import axios from "axios";

const https = axios.create({
  baseURL: process.env.API_URL,
});

export async function buildUserBase(guild) {
  const members = await guild.members.fetch();
  const discordUsers = members
    .filter((member) => !member.user.bot)
    .map(({ user, displayName }) => ({
      discordId: user.id,
      discordName: displayName,
      discordGuildId: guild.id,
    }));
  return (await https.post(`discord/guild/${guild.id}/user`, discordUsers))
    .data;
}

export async function addPresent(guildId, userId, priority, description) {
  return (
    await https.post(`discord/guild/${guildId}/user/${userId}/present`, [
      { priority, description },
    ])
  ).data;
}

export async function getUserPresents(guildId, userId) {
  return (await https.get(`discord/guild/${guildId}/user/${userId}/present`))
    .data;
}

export async function getGuildPresents(guildId) {
  return (await https.get(`discord/guild/${guildId}/present`)).data;
}

export async function addMember(guildId, displayName, userId) {
  return https.post("discord/user", [
    { discordId: userId, discordName: displayName, discordGuildId: guildId },
  ]).data;
}

export async function getMembers(guildId, discordUserIds) {
  return (
    await https.get(`discord/guild/${guildId}/user`, {
      params: { discordUserIds },
    })
  ).data;
}

export async function updateMembers(guildId, users) {
  return (await https.put(`discord/guild/${guildId}/user`, users)).data;
}

export async function getAllGuilds() {
  return (await https.get("discord/guild")).data;
}

export async function addGuilds(guildIds) {
  return (await https.post("discord/guild", guildIds)).data;
}
