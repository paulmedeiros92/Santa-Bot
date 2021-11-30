const { buildUserBase } = require('../services/firestore-service');
const log4js = require('../logger');
const { createRoles, createEmojis, evaluateAllUserRoles } = require('../services/ready-service');

const logger = log4js.buildLogger();

module.exports = {
  name: 'guildCreate',
  once: false,
  async execute(guild) {
    try {
      await buildUserBase(guild);
      await Promise.all(createRoles(guild));
      await createEmojis(guild);
      await evaluateAllUserRoles(guild);
      logger.info('Guild setup complete.');
    } catch (error) {
      logger.error(`Guild setup fail:${error}`);
    }
  },
};
