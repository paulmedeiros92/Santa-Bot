const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('present')
    .setDescription('Tell me what you want for X-mas!'),
  async execute(interaction) {
    await interaction.reply('Good Good!');
  },
};
