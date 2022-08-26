import Discord from "discord.js";
const allIntents: Discord.ClientOptions = {
    intents: new Discord.Intents(32767),
};
const client = new Discord.Client(allIntents);
client.on("ready", async () => {
    console.log("ready!");
});
client.login("");