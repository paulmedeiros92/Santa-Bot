const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nice')
    .setDescription('Name another nice!'),
  async execute(interaction) {
    await interaction.reply('Good Good!');
  },
};
