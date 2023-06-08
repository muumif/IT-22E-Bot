import axios from "axios";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { TahvelTunniplaan } from "../types/types";
import moment from "moment";
moment.locale("et");

module.exports = {
      data: new SlashCommandBuilder()
            .setName("tunnid")
            .setDescription("Vaata erinevate päevade tunniplaani!")
            .addStringOption(option =>
                  option
                        .setName("paev")
                        .setDescription("Mis päeva tunniplaani soovid vaadata!")
                        .setRequired(true)
                        .addChoices(
                              { name: "Esmaspäev", value: "0" },
                              { name: "Teisipäev", value: "1" },
                              { name: "Kolmapäev", value: "2" },
                              { name: "Neljapäev", value: "3" },
                              { name: "Reede", value: "4" },
                        )),
      async execute(interaction: CommandInteraction) {
            try {
                  await interaction.deferReply();
                  // Ugly could do better but works so fuck it
                  const today = new Date();
                  const diff = today.getDate() - today.getDay() + (today.getDay() == 0 ? -6 : 1);
                  const monday = new Date(today.setDate(diff));
                  const selectedDay = new Date(monday.setDate(monday.getDate() + Number(interaction.options.get("paev")?.value)));
      
                  const data = await (await axios.get(encodeURI(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByGroup/14?from=${selectedDay.toISOString()}&studentGroups=6932&thru=${selectedDay.toISOString()}`))).data as TahvelTunniplaan;
                  const events = async () => {
                        const events = [];
                        for (let i = 0; i < data.timetableEvents.length; i++) {
                              if (new Date(data.timetableEvents[i].date).getDate() == selectedDay.getDate()) {
                                    let building_code: "A" | "B" | "" = "";
                                    let room_code = "";
                                    if (data.timetableEvents[i].rooms.length != 0) {
                                          building_code = data.timetableEvents[i].rooms[0]?.buildingCode as "A" | "B";
                                          room_code = data.timetableEvents[i].rooms[0]?.roomCode as string;
                                    }
                                    if (data.timetableEvents[i].nameEt != null) {
                                          events.push({
                                                name: data.timetableEvents[i].nameEt,
                                                startTime: data.timetableEvents[i].timeStart,
                                                endTime: data.timetableEvents[i].timeEnd,
                                                class: `${building_code}-${room_code}`,
                                          });
                                    }
                              }
                        }
                        events.sort((a, b) => {
                              return Number(a.startTime.replace(":", "")) - Number(b.startTime.replace(":", ""));
                        });
      
                        return events;
                  };
      
                  const tunniplaanEmbed = new EmbedBuilder()
                        .setTitle(`${moment(selectedDay).format("dddd").charAt(0).toUpperCase() + moment(selectedDay).format("dddd").slice(1)} ${moment(selectedDay).format("Do MMM")}`);
                  const loop = async (events: Array<{ name: string, startTime: string, endTime: string,  class: string}>) => {
                        for (let i = 0; i < events.length; i++) {
                              tunniplaanEmbed.addFields(
                                    {
                                          name: events[i].name,
                                          value: `${events[i].startTime} - ${events[i].endTime}\n${events[i].class}`,
                                          inline: false,
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
            } catch (error) {
                  console.log(error);
            }
      },
};