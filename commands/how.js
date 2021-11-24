const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('how')
    .setDescription('How to use?'),
  async execute(interaction) {
    await interaction.reply('Good Good!');
  },
};
