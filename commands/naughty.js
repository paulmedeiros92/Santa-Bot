const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('naughty')
    .setDescription('Name another naughty!'),
  async execute(interaction) {
    await interaction.reply('Naughty Naughty!');
  },
};
