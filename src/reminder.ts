import axios from "axios";
import schedule from "node-schedule";
import { client } from ".";
import { TahvelTunniplaan } from "./types/types";

export const lessonChecker = schedule.scheduleJob("00 07 * * *", async function() {
      const today = new Date();
      const data = await (await axios.get(`https://tahvel.edu.ee/hois_back/timetableevents/timetableByGroup/14?from=${today.toISOString()}&studentGroups=6932&thru=${today.toISOString()}`)).data as TahvelTunniplaan;
      data.timetableEvents.forEach(timetableEvent => {
            const [minutes, hours] = [Number(timetableEvent.timeStart.split(":")[1]), Number(timetableEvent.timeStart.split(":")[0])];
            schedule.scheduleJob(`${minutes - 5} ${hours} * * *`, async function() {
                  const user = await client.users.fetch(process.env.USER_ID);
                  user.send(`Tund: ${timetableEvent.nameEt} hakkab 5 minuti pärast!\nKlassis: ${timetableEvent.rooms[0].buildingCode}-${timetableEvent.rooms[0].roomCode}`);
            });
            schedule.scheduleJob(`${minutes} ${hours} * * *`, async function() {
                  const user = await client.users.fetch(process.env.USER_ID);
                  user.send(`Tund: ${timetableEvent.nameEt} hakkas!\nKlassis: ${timetableEvent.rooms[0].buildingCode}-${timetableEvent.rooms[0].roomCode}`);
            });
      });
});
