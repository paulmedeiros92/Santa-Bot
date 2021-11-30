const { addMember } = require('../services/firestore-service');
const log4js = require('../logger');

const logger = log4js.buildLogger();

module.exports = {
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
