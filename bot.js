import 'dotenv/config';
import fs from 'fs';
import { Client, Collection, GatewayIntentBits } from "discord.js";
import logger from './logger.js';

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => logger.info("Santa Bot is coming...to town."))

// EVENTS
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));
eventFiles.forEach(async (file) => {
  const event = await import(`./events/${file}`);
  client.on(event.default.name, (...args) => event.default.execute(...args));
});

// COMMANDS
client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
commandFiles.forEach(async (file) => {
  const command = (await import(`./commands/${file}`)).default;
  if('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
});

client.login(process.env.DISCORD_TOKEN);
