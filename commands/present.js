const { SlashCommandBuilder } = require('@discordjs/builders');
const { addPresent } = require('../fire-store');
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
      await addPresent(interaction.guildId, { userId: interaction.user.id, rank, description });
      await interaction.reply({ content: `Added "${description}" to rank #${rank}`, ephemeral: true });
      logger.info(`${interaction.user.username} added "${description}" to rank #${rank}`);
    } catch (error) {
      logger.error(`User ${interaction.user.username} failed to add ${description} to rank #${rank}\n${error}`);
    }
  },
};
