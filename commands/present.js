const { SlashCommandBuilder } = require('@discordjs/builders');
const { addPresent, getUserPresents } = require('../services/firestore-service');
const { buildUserPresentList } = require('../services/reply-service');
const log4js = require('../logger');

const logger = log4js.buildLogger();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('present')
    .setDescription('Tell me what you want for X-mas!')
    .addIntegerOption((option) => option.setName('rank').setDescription('Rank the gift!').setRequired(true))
    .addStringOption((option) => option.setName('description').setDescription('Describe the gift!').setRequired(true)),
  async execute(interaction) {
    const rank = interaction.options.getInteger('rank');
    const description = interaction.options.getString('description');
    try {
      await addPresent(
        interaction.guildId,
        {
          userId: interaction.user.id, username: interaction.user.username, rank, description,
        },
      );
      const message = buildUserPresentList(
        await getUserPresents(interaction.guildId, interaction.user.id),
        interaction.user.username,
        { description, rank },
      );
      message.ephemeral = true;
      interaction.reply(message);
      logger.info(`${interaction.user.username} added "${description}" to rank #${rank}`);
    } catch (error) {
      logger.error(`User ${interaction.user.username} failed to add ${description} to rank #${rank}\n${error}`);
    }
  },
};
