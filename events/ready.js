import {
  addGuilds,
  getAllGuilds,
} from "../services/api-service.js";
import logger from "../logger.js";
import {
  buildUserBase,
  createRoles,
  evaluateAllUserRoles,
} from "../services/ready-service.js";

export default {
  name: "ready",
  async execute(client) {
    try {
      const initializedIds = (await getAllGuilds()).map(
        ({ guildId }) => guildId
      );
      const unInitialized = client.guilds.cache.filter(
        ({ id }) => !initializedIds.includes(id)
      );
      await Promise.all(client.guilds.cache.map((guild) => buildUserBase(guild)));
      await Promise.all(unInitialized.map((guild) => createRoles(guild)));
      await Promise.all(
        unInitialized.map((guild) => evaluateAllUserRoles(guild))
      );
      await addGuilds(unInitialized.map(({ id }) => id));
      logger.info("Bot setup complete.");
    } catch (error) {
      logger.error(`Bot setup fail:${error}`);
    }
  },
};
