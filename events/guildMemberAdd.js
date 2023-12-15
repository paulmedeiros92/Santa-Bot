import { addMember } from "../services/api-service.js";
import logger from "../logger.js";

export default {
  name: "guildMemberAdd",
  once: false,
  async execute(guildMember) {
    const displayName = guildMember.user?.displayName ?? guildMember.user.id;
    try {
      await addMember(
        guildMember.guild.id,
        guildMember.user.displayName,
        guildMember.user.id
      );
      logger.info(
        `Successfully added ${displayName} to "${guildMember.guild.name}" (${guildMember.guild.id}) members list`
      );
    } catch (error) {
      logger.error(
        `Failed to add ${displayName} to "${guildMember.guild.name}" (${guildMember.guild.id}) members list: ${error}`
      );
    }
  },
};
