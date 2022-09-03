import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { cwd } from "process";

const commands: any[] = [];
const commandFiles = readdirSync(`${cwd()}/prod/commands`).filter(file => file.endsWith(".js"));

const clientId = "1015247609138515980";
const guildId = "1014174185720913960";

for (const file of commandFiles) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(`${cwd()}/prod/commands/${file}`);
      commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
      try {
            console.log("Refreshing commands!");

            rest.put(
                  Routes.applicationGuildCommands(clientId, guildId),
                  { body: commands },
            );

            console.log("Refreshed commands!");
      }
      catch (error) {
            console.error(error);
      }
})();