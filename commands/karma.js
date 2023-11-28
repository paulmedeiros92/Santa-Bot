import { SlashCommandBuilder } from "@discordjs/builders";
import { buildLeaderboard } from "../services/reply-service.js";
import { getMembers } from "../services/api-service.js";
import logger from "../logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("karma")
    .setDescription("Look at the karma leaderboard!")
    .addBooleanOption((option) =>
      option
        .setName("public")
        .setDescription("Make this post public (everyone can see)")
    ),
  async execute(commandInteraction) {
    try {
      const members = (await getMembers(commandInteraction.guildId, [])).sort(
        (memberA, memberB) => memberB.karma - memberA.karma
      );
      const message = buildLeaderboard(members);
      message.ephemeral = !commandInteraction.options.getBoolean("public");
      commandInteraction.reply(message);
      logger.info(
        `${commandInteraction.user.id} successfully executed the karma command`
      );
    } catch (error) {
      logger.error(
        `${commandInteraction.user.id} failed to execute karma command:\n${error}`
      );
      logger.error(error);
    }
  },
};
