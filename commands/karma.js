const { SlashCommandBuilder } = require('@discordjs/builders');
const { buildLeaderboard } = require('../canned-messages');
const { getMembers } = require('../fire-store');
const log4js = require('../logger');

const logger = log4js.buildLogger();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('karma')
    .setDescription('Peek at my list!')
    .addBooleanOption((option) => option.setName('public').setDescription('Make this post public (everyone can see)')),
  async execute(commandInteraction) {
    try {
      const userIds = (await commandInteraction.guild.members.fetch())
        .filter((member) => !member.user.bot)
        .map((member) => member.user.id);
      const members = (await getMembers(commandInteraction.guildId, userIds))
        .sort((memberA, memberB) => memberB.karma - memberA.karma);
      const message = buildLeaderboard(members);
      message.ephemeral = !commandInteraction.options.getBoolean('public');
      commandInteraction.reply(message);
      logger.info(`${commandInteraction.user.username} successfully executed the karma command`);
    } catch (error) {
      logger.error(`${commandInteraction.user.username} failed to execute karma command:\n${error}`);
    }
  },
};
