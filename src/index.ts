import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { ChannelType, Client, Collection, EmbedBuilder, GatewayIntentBits, Partials, Command } from "discord.js";
import axios from "axios";
import { BodyMail, TahvelTunniplaan } from "./types/types";
import { readdirSync } from "fs";
import path from "path";
import "./reminder";
import moment from "moment";
moment.locale("et");

const app: Express = express();
export const client = new Client({ intents: [GatewayIntentBits.DirectMessages], partials: [Partials.Channel] });
const port = process.env.PORT;
const commandsPath = path.join(__dirname, "commands");
const commands: Collection<unknown, Command> = new Collection();
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(filePath);
      commands.set(command.data.name, command);
}

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
      res.send("Online!");
});

client.once("ready", () => {
      console.log("[discord.js]: Bot is now online!");
});

client.on("interactionCreate", async interaction => {
      if (!interaction.isChatInputCommand()) return;

      const command = commands.get(interaction.commandName);

      if (!command) return;
      try {
            await command.execute(interaction);
            console.log(`[discord.js]: Used command ${interaction.commandName}`);
      }
      catch (error) {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            console.log(`[discord.js]: An error accured: ${error}`);
      }
});

client.on("messageCreate", async interaction => {
      if (interaction.channel.type == ChannelType.DM && interaction.author.id == process.env.USER_ID) {
            if (interaction.content === "test") {
                  const user = await client.users.fetch(process.env.USER_ID);

                  // Ugly could do better but works so fuck it
                  const today = new Date();
                  const diff = today.getDate() - today.getDay() + (today.getDay() == 0 ? -6 : 1);
                  const monday = new Date(today.setDate(diff));
                  const selectedDay = new Date(monday.setDate(monday.getDate() + 2));


                  user.send(selectedDay.toISOString());
            }
            if (interaction.content === "tana") {
                  const today = new Date();
                  const user = await client.users.fetch(process.env.USER_ID);
                  const data = await (await axios.get(encodeURI(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByGroup/14?from=${today.toISOString()}&studentGroups=6932&thru=${today.toISOString()}`))).data as TahvelTunniplaan;
                  const events = async () => {
                        const events = [];
                        for (let i = 0; i < data.timetableEvents.length; i++) {
                              if (new Date(data.timetableEvents[i].date).getDate() == today.getDate()) {
                                    events.push({
                                          name: data.timetableEvents[i].nameEt,
                                          startTime: data.timetableEvents[i].timeStart,
                                          endTime: data.timetableEvents[i].timeEnd,
                                          teacher: data.timetableEvents[i].teachers[0].name,
                                          class: `${data.timetableEvents[i].rooms[0].buildingCode}-${data.timetableEvents[i].rooms[0].roomCode}`,
                                    });
                              }
                        }
                        events.sort((a, b) => {
                              return Number(a.startTime.replace(":", "")) - Number(b.startTime.replace(":", ""));
                        });

                        return events;
                  };

                  const tunniplaanEmbed = new EmbedBuilder()
                        .setTitle(`${moment(today).format("dddd").charAt(0).toUpperCase() + moment(today).format("dddd").slice(1)} ${moment(today).format("Do MMM")}`)
                        .setColor("DarkRed");
                  const loop = async (events: Array<{ name: string, startTime: string, endTime: string, teacher: string, class: string}>) => {
                        for (let i = 0; i < events.length; i++) {
                              tunniplaanEmbed.addFields(
                                    {
                                          name: events[i].name,
                                          value: `${events[i].startTime} - ${events[i].endTime}\n${events[i].teacher}\n${events[i].class}`,
                                          inline: true,
                                    },
                              );
                        }
                        if (tunniplaanEmbed.data.fields === undefined) {
                              tunniplaanEmbed.setDescription("Täna ei toimu ühtegi tundi!");
                        }
                        await user.send({ embeds: [tunniplaanEmbed] });
                        console.log("[discord.js]: Sent DM command: tana");
                  };

                  const allEvents = await events();
                  await loop(allEvents);
            }
      }
});

app.post("/receive/mail", async (req: Request, res: Response) => {
      if (req.headers["user-agent"] == "Integrately") {
            console.log("[express]: Received post request /receive/mail");
            const mail = req.body as BodyMail;

            mail.message = mail.message.replace(/<[^>]*>?/gi, "").replace(new RegExp("&nbsp", "g"), " ").replace(new RegExp(";", "g"), "").substr(0, 512) + "\u2026";
            const link = (await (await axios.post(encodeURI(`${process.env.BITLY_ENDPOINT}/v4/shorten`), { "long_url": mail["web-link"] }, { headers:{ "Authorization": `Bearer ${process.env.BITLY_TOKEN}` } })).data).link as string;
            mail["web-link"] = link;
            const mailEmbed = new EmbedBuilder()
                  .setTitle(mail.title)
                  .setDescription(`${mail["from-name"]} (${mail["from-mail"]})`)
                  .setTimestamp(new Date(mail["created-at"]))
                  .setColor("DarkRed")
                  .addFields(
                        {
                              name: "Message",
                              value: `${mail.message}`,
                              inline: false,
                        },
                        {
                              name: "Link",
                              value: `\n${mail["web-link"]}`,
                              inline: false,
                        },
                  );
            const user = await client.users.fetch(process.env.USER_ID);
            await user.send({ embeds: [mailEmbed] });
            console.log("[discord.js]: Sent email notification!");
            res.sendStatus(200);
      }
      else {
            res.sendStatus(403);
            console.log(`[express]: 403 error from: ${req}`);
      }
});

app.listen(port, () => {
      console.log("[express]: Server running on port " + port);
});

client.login(process.env.DISCORD_TOKEN);