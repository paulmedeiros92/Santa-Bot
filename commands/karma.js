const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('karma')
    .setDescription('Peek at my list!XXX'),
  async execute(interaction) {
    await interaction.reply('Good Good!');
  },
};
