import 'dotenv/config';
const env = {
    bot: {
        prefix: process.env.BOT_PREFIX as string,
        token: process.env.BOT_TOKEN as string,
        noticeChannelId: process.env.BOT_NOTICE_CHANNEL_ID as string
    }
}

export default env;