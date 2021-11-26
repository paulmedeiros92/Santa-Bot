const { SlashCommandBuilder } = require('@discordjs/builders');
const { getMembers } = require('../fire-store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('naughty')
    .setDescription('Name another naughty!')
    .addSubcommand((subcommand) => subcommand
      .setName('user')
      .setDescription('Info about a user')
      .addUserOption((option) => option.setName('target').setDescription('The user'))),
  async execute(interaction) {
    getMembers(interaction.guildId, interaction.message.mentions);
    await interaction.reply('Naughty Naughty!');
  },
};
