const { SlashCommandBuilder } = require('@discordjs/builders');
const { buildLeaderboard } = require('../canned-messages');
const { getMembers } = require('../fire-store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('karma')
    .setDescription('Peek at my list!XXX'),
  async execute(commandInteraction) {
    const userIds = (await commandInteraction.guild.members.fetch())
      .filter((member) => !member.user.bot)
      .map((member) => member.user.id);
    const members = (await getMembers(commandInteraction.guildId, userIds))
      .sort((memberA, memberB) => memberB.karma - memberA.karma);
    commandInteraction.reply(buildLeaderboard(members));
  },
};
