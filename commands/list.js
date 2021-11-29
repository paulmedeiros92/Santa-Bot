const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserPresents } = require('../fire-store');
const { buildUserPresentList, buildSantasPresentList } = require('../canned-messages');
const log4js = require('../logger');

const logger = log4js.buildLogger();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Peek at a present list')
    .addUserOption((option) => option.setName('friend').setDescription('Select a friend'))
    .addBooleanOption((option) => option.setName('public').setDescription('Make this post public (everyone can see)')),
  async execute(commandInteraction) {
    const friend = commandInteraction.options.getUser('friend');

    try {
      let message;
      if (friend) {
        message = buildUserPresentList(
          friend.username,
          await getUserPresents(commandInteraction.guildId, friend.id),
        );
      } else {
        message = buildSantasPresentList(await getUserPresents(commandInteraction.guildId));
      }
      message.ephemeral = !commandInteraction.options.getBoolean('public');
      commandInteraction.reply(message);
      logger.info(`${commandInteraction.user.username} looked at "${friend ? friend.username : 'everyone'}"'s presents`);
    } catch (error) {
      logger.error(`User ${commandInteraction.user.username} failed to look at ${friend.username}'s presents\n${error}`);
    }
  },
};
