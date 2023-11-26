import { parseKarmaMessage } from '../services/message-service.js';
import logger from '../logger.js';

export default {
  name: 'messageCreate',
  async execute(message) {
    try {
      const memberMentions = await parseKarmaMessage(message);
      if (memberMentions.length > 0) {
        message.reply(memberMentions
          .reduce((prevValue, currentMember) => `${prevValue}Updated ${currentMember.discordName}'s karma to ${currentMember.karma}\n`, ''));
        logger.info(`Successfully parsed ${message.author.username}'s message content: ${message.content}'`);
      }
    } catch (error) {
      logger.error(`Failed to parse ${message.author.username}'s message content: ${message.content}'`);
      logger.error(`With error: ${error}`);
    }
  },
};
