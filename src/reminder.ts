import axios from "axios";
import { EmbedBuilder, TextChannel } from "discord.js";
import schedule from "node-schedule";
import { client } from ".";
import { TahvelTunniplaan } from "./types/types";

export const lessonChecker = schedule.scheduleJob("00 07 * * *", async function() {
      const today = new Date();
      const data = await (await axios.get(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByGroup/14?from=${today.toISOString()}&studentGroups=6932&thru=${today.toISOString()}`)).data as TahvelTunniplaan;
      data.timetableEvents.forEach(async timetableEvent => {
            const [date, minutes, hours] = [new Date(timetableEvent.date), Number(timetableEvent.timeStart.split(":")[1]), Number(timetableEvent.timeStart.split(":")[0])];
            const channel = await client.channels.fetch("1015312371494944828") as TextChannel;
            date.setMinutes(minutes - 5);
            date.setHours(hours);
            schedule.scheduleJob(date, async function() {
                  const embed = new EmbedBuilder()
                        .setTitle(`Tund: ${timetableEvent.nameEt}`)
                        .setDescription(`<t:${Math.floor(date.getTime() / 1000)}:R>\nKlassis: ${timetableEvent.rooms[0].buildingCode}-${timetableEvent.rooms[0].roomCode}\n`);
                  await channel.send({ embeds: [embed] });
                  console.log(`[discord.js]: Sent 5 minute reminder to ${channel.name}`);
            });
      });
});

