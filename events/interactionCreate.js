const log4js = require('../logger');
const logger = log4js.buildLogger();

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Command execution failure: ${error}`);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
