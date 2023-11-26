import { buildUserBase } from '../services/api-service.js';
import logger from '../logger.js';
import { createRoles, createEmojis, evaluateAllUserRoles } from '../services/ready-service.js';

export default {
  name: 'guildCreate',
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
