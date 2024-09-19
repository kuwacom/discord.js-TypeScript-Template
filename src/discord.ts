import Discord from "discord.js";

// Statusをスマホアイコンにする
// (Discord.DefaultWebSocketManagerOptions.identifyProperties.browser as any) = "Discord iOS"

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.GuildEmojisAndStickers
    ],
});

export default client;