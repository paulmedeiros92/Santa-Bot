import { buildUserBase } from "../services/api-service.js";
import logger from "../logger.js";
import {
  createRoles,
  createEmojis,
  evaluateAllUserRoles,
} from "../services/ready-service.js";

export default {
  name: "ready",
  async execute(client) {
    try {
      await Promise.all(
        client.guilds.cache.map((guild) => buildUserBase(guild))
      );
      await Promise.all(client.guilds.cache.map((guild) => createRoles(guild)));
      await Promise.all(
        client.guilds.cache.map((guild) => createEmojis(guild))
      );
      await Promise.all(
        client.guilds.cache.map((guild) => evaluateAllUserRoles(guild))
      );
      logger.info("Bot setup complete.");
    } catch (error) {
      logger.error(`Bot setup fail:${error}`);
    }
  },
};
