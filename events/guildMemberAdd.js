import { addMember } from '../services/api-service.js';
import logger from '../logger.js';

export default {
  name: 'guildMemberAdd',
  once: false,
  async execute(guildMember) {
    try {
      await addMember(guildMember.guild.id, guildMember.user);
      logger.info(`Successfully added ${guildMember.user.username} to "${guildMember.guild.name}" (${guildMember.guild.id}) members list`);
    } catch (error) {
      logger.error(`Failed to add ${guildMember.user.username} to "${guildMember.guild.name}" (${guildMember.guild.id}) members list: ${error}`);
    }
  },
};
