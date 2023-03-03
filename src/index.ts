import Discord from "discord.js";
import botSetting from "./setting.json";
import { commands } from "./utiles/CommandFramework";

const allIntents: Discord.ClientOptions = {
    intents: new Discord.Intents(32767), // インテンツは自分で設定
};
const client = new Discord.Client(allIntents);
client.on("ready", async () => {
    console.log("ready!");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.split(" ")[0].startsWith(botSetting.prefix)) return;
    if (message.member == null) return;
    if (message.guild == null) return;

    const [cmd, ...args] = message.content.slice(botSetting.prefix.length).replace("　", " ").split(" ").filter(v => v != "");

    Object.keys(botSetting.command).forEach(function (commandName) {
        //@ts-ignore
        if (botSetting.command[commandName].includes(cmd)) commands[commandName].executeMessage(message);
        return;
    });
});    

client.on('interactionCreate', async (interaction) => {
    if (!interaction.guild || !interaction.member) return;
    if (interaction.isCommand()) {
        
        // Object.keys(commands).forEach(key => {
        //     console.log(key)
        // })
        if (interaction.commandName in commands) commands[interaction.commandName].executeInteraction(interaction);
        // return;
    }
});

client.login(botSetting.token);