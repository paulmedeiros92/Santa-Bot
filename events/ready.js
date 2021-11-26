const fireStore = require('../fire-store');
const log4js = require('../logger');

const logger = log4js.buildLogger();

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      await fireStore.buildUserBase(client);
      logger.info('Guild table setup complete.');
    } catch (error) {
      logger.error(`Guild table setup fail:${error}`);
    }
  },
};
