import "dotenv/config";
import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const commands = [];
// Grab all the command files from the commands directory you created earlier
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const foldersPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(foldersPath)
  .filter((file) => file.endsWith(".js"));
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(foldersPath, file);
  const command = (await import(filePath)).default;
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

// const commandIds = [
// ];
// // and remove your commands!
// try {
//   console.log(
//     `Started removing ${commandIds.length} application (/) commands.`
//   );

//   // The put method is used to fully refresh all commands in the guild with the current set
//   await Promise.all(
//     commandIds.map((id) =>
//       rest.delete(Routes.applicationCommand(process.env.DISCORD_CLIENT_ID, id))
//     )
//   );

//   console.log(`Successfully reloaded application (/) commands.`);
// } catch (error) {
//   // And of course, make sure you catch and log any errors!
//   console.error(error);
// }
