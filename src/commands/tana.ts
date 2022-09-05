import axios from "axios";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { TahvelTunniplaan } from "../types/types";
import moment from "moment";
moment.locale("et");

module.exports = {
      data: new SlashCommandBuilder()
            .setName("täna")
            .setDescription("Tänased tunnid!"),
      async execute(interaction: CommandInteraction) {
            await interaction.deferReply();
            const today = new Date();
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
                  .setTitle(`${moment(today).format("dddd").charAt(0).toUpperCase() + moment(today).format("dddd").slice(1)} ${moment(today).format("Do MMM")}`);
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
                  await interaction.editReply({ embeds: [tunniplaanEmbed] });
            };

            const allEvents = await events();
            await loop(allEvents);
      },
};