import { parseKarmaMessage } from "../services/message-service.js";
import logger from "../logger.js";

export default {
  name: "messageCreate",
  async execute(message) {
    try {
      const memberMentions = await parseKarmaMessage(message);
      const displayName = message.author?.displayName ?? message.author.id;
      if (memberMentions.length > 0) {
        message.reply(
          memberMentions.reduce(
            (prevValue, currentMember) =>
              `${prevValue}Updated ${currentMember.discordName}'s karma to ${currentMember.karma}\n`,
            ""
          )
        );
        logger.info(
          `Successfully parsed ${displayName}'s message content: ${message.content}'`
        );
      }
    } catch (error) {
      logger.error(
        `Failed to parse ${displayName}'s message content: ${message.content}'`
      );
      logger.error(`With error: ${error}`);
    }
  },
};
