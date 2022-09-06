import axios from "axios";
import { EmbedBuilder, TextChannel } from "discord.js";
import schedule from "node-schedule";
import { client } from ".";
import { TahvelTunniplaan } from "./types/types";

export const lessonChecker = schedule.scheduleJob("00 07 * * *", async function() {
      const today = new Date();
      const data = await (await axios.get(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByGroup/14?from=${today.toISOString()}&studentGroups=6932&thru=${today.toISOString()}`)).data as TahvelTunniplaan;
      data.timetableEvents.forEach(timetableEvent => {
            const [minutes, hours] = [Number(timetableEvent.timeStart.split(":")[1]), Number(timetableEvent.timeStart.split(":")[0])];
            schedule.scheduleJob(`${minutes - 5} ${hours} * * *`, async function() {
                  const channel = client.channels.cache.get("1015312371494944828") as TextChannel; // Prolly should make channel ID changeable via command or into .env
                  const embed = new EmbedBuilder()
                        .setTitle(`Tund: ${timetableEvent.nameEt}`)
                        .setDescription(`Algab 5 minuti pärast!\n Klassis: ${timetableEvent.rooms[0].buildingCode}-${timetableEvent.rooms[0].roomCode}`);
                  channel.send({ embeds: [embed] });
            });
            schedule.scheduleJob(`${minutes - 2} ${hours} * * *`, async function() {
                  const channel = client.channels.cache.get("1015312371494944828") as TextChannel;
                  const embed = new EmbedBuilder()
                        .setTitle(`Tund: ${timetableEvent.nameEt}`)
                        .setDescription(`Algab 2 minuti pärast!\n Klassis: ${timetableEvent.rooms[0].buildingCode}-${timetableEvent.rooms[0].roomCode}`);
                  channel.send({ embeds: [embed] });
            });
            schedule.scheduleJob(`${minutes} ${hours} * * *`, async function() {
                  const channel = client.channels.cache.get("1015312371494944828") as TextChannel;
                  const embed = new EmbedBuilder()
                        .setTitle(`Tund: ${timetableEvent.nameEt}`)
                        .setDescription(`Algas!\n Klassis: ${timetableEvent.rooms[0].buildingCode}-${timetableEvent.rooms[0].roomCode}`);
                  channel.send({ embeds: [embed] });
            });
      });
});
