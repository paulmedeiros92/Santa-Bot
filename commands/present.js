import { SlashCommandBuilder } from "@discordjs/builders";
import { addPresent, getUserPresents } from "../services/api-service.js";
import { buildUserPresentList } from "../services/reply-service.js";
import logger from "../logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("present")
    .setDescription("Tell me what you want for X-mas!")
    .addIntegerOption((option) =>
      option.setName("rank").setDescription("Rank the gift!").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Describe the gift!")
        .setRequired(true)
    ),
  async execute(interaction) {
    const priority = interaction.options.getInteger("rank");
    const description = interaction.options.getString("description");
    try {
      await addPresent(
        interaction.guildId,
        interaction.user.id,
        priority,
        description
      );
      const message = buildUserPresentList(
        await getUserPresents(interaction.guildId, interaction.user.id),
        interaction.user.displayName,
        { description, priority }
      );
      message.ephemeral = true;
      interaction.reply(message);
      logger.info(
        `${interaction.user.displayName} added "${description}" to rank #${priority}`
      );
    } catch (error) {
      logger.error(
        `User ${interaction.user.displayName} failed to add ${description} to rank #${priority}\n${error}`
      );
    }
  },
};
