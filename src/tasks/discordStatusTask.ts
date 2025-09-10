import { getShardsConnectionCount } from '@/api/getShardsConnectionCount';
import { setShardConnectionCount } from '@/api/setShardConnectionCount';
import { client, getShardId, getTotalGuildCount } from '@/services/discord';
import { sleep } from '@/utils/utiles';
import { ActivityType } from 'discord.js';

export default async function discordStatusTask(intervalMs: number = 60000) {
  // client.user?.setStatus("idle");
  while (true) {
    if (client.shard?.ids.length === 0) {
      /////////////////////
      // シャードでの運用 //
      /////////////////////
      let playServerNum = 0;

      await setShardConnectionCount(getShardId(), playServerNum);
      playServerNum = (await getShardsConnectionCount()) ?? playServerNum;

      let guildSize; // https://discordjs.guide/sharding/#fetchclientvalues
      await client.shard
        ?.fetchClientValues('guilds.cache.size')
        .then((results) => {
          guildSize = results.reduce(
            (acc, guildCount) => (acc as number) + (guildCount as number)
          );
        });
      client.user?.setPresence({
        activities: [
          {
            name: `${playServerNum}/${guildSize} サーバー`,
            type: ActivityType.Competing,
          },
        ],
      });
      await sleep(10000);
      client.user?.setPresence({
        activities: [{ name: `/help`, type: ActivityType.Listening }],
      });
      await sleep(1000);
    } else {
      ////////////////////////
      // シャードなしでの運用 //
      ////////////////////////
      client.user?.setPresence({
        activities: [
          {
            name: `${await getTotalGuildCount(client)} サーバー`,
            type: ActivityType.Competing,
          },
        ],
      });
      await sleep(10000);

      client.user?.setPresence({
        activities: [{ name: `/help`, type: ActivityType.Listening }],
      });
      await sleep(5000);
    }
  }
}
