const fireStore = require('../fire-store');
const log4js = require('../logger');
const { evaluateAllUserRoles } = require('../guild-setup');

const logger = log4js.buildLogger();

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      await fireStore.buildUserBase(client);
      client.guilds.cache.each((guild) => evaluateAllUserRoles(guild));
      logger.info('Bot setup complete.');
    } catch (error) {
      logger.error(`Bot setup fail:${error}`);
    }
  },
};
