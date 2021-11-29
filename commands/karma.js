const { SlashCommandBuilder } = require('@discordjs/builders');
const { buildLeaderboard } = require('../canned-messages');
const { getMembers } = require('../fire-store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('karma')
    .setDescription('Peek at my list!')
    .addSubcommand((subCommand) => subCommand
      .setName('public')
      .setDescription('Post leaderboard publicly'))
    .addSubcommand((subCommand) => subCommand
      .setName('private')
      .setDescription('Post leaderboard privately (only you can see)')),
  async execute(commandInteraction) {
    const userIds = (await commandInteraction.guild.members.fetch())
      .filter((member) => !member.user.bot)
      .map((member) => member.user.id);
    const members = (await getMembers(commandInteraction.guildId, userIds))
      .sort((memberA, memberB) => memberB.karma - memberA.karma);
    const message = buildLeaderboard(members);
    message.ephemeral = commandInteraction.options.getSubcommand() === 'private';
    commandInteraction.reply(message);
  },
};
