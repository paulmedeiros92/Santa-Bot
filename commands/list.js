import { SlashCommandBuilder } from "@discordjs/builders";
import { getUserPresents, getGuildPresents } from "../services/api-service.js";
import {
  buildUserPresentList,
  buildSantasPresentList,
} from "../services/reply-service.js";
import logger from "../logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Peek at a present list")
    .addUserOption((option) =>
      option.setName("friend").setDescription("Select a friend")
    )
    .addBooleanOption((option) =>
      option
        .setName("public")
        .setDescription("Make this post public (everyone can see)")
    ),
  async execute(interaction) {
    const friend = interaction.options.getUser("friend");

    try {
      let message;
      if (friend) {
        message = buildUserPresentList(
          await getUserPresents(interaction.guildId, friend.id),
          friend.displayName
        );
      } else {
        message = buildSantasPresentList(
          await getGuildPresents(interaction.guildId)
        );
      }
      message.ephemeral = !interaction.options.getBoolean("public");
      interaction.reply(message);
      logger.info(
        `${interaction.user.username} looked at "${
          friend ? friend.username : "everyone"
        }"'s presents`
      );
    } catch (error) {
      logger.error(
        `User ${interaction.user.username} failed to look at ${friend.username}'s presents\n${error}`
      );
    }
  },
};
