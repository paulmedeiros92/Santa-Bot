const { buildUserBase } = require("../services/api-service");
const log4js = require("../logger");
const {
  createRoles,
  createEmojis,
  evaluateAllUserRoles,
} = require("../services/ready-service");

const logger = log4js.buildLogger();

module.exports = {
  name: "ready",
  once: true,
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
