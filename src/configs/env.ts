import 'dotenv/config';
const env = {
  bot: {
    prefix: process.env.BOT_PREFIX as string,
    token: process.env.BOT_TOKEN as string,
  },
  shardSyncAPIAddress: process.env.SHARD_SYNC_API_ADDRESSES as string,
};

export default env;
