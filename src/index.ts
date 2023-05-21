import Discord from "discord.js";
// @ts-ignore
import config from "../setting.json";
import fs from "fs";
import { autoDeleteMessage, slashCommands, commands, buttons, sleep, sec2HHMMSS, randRange } from "./modules/utiles"
import { Logger } from 'tslog'
import * as Types from "./modules/types";
import * as FormatERROR from "./format/error";

const logger = new Logger();
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
    // ws: { properties: { browser: "Discord iOS" } } 
});

// エラーハンドリング
process.on("uncaughtException", (err) => {
    logger.error(err.toString());
});

// npm test 等一番上のディレクトリで実行する際
// ./dist/ になるためcommands に dist を追加する必要あり
const TSDistPath = "./dist";
(async () => {
    logger.info("Loading Commands...");
    const commandFiles = fs.readdirSync(TSDistPath+'/commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command: Types.Command = require(`./commands/${file}`);
        logger.info(`import Command: ${command.command.name}`);
        commands[command.command.name] = command;
        slashCommands.unshift(command.command)
    } 
})();
(async () => {
    logger.info("Loading Interaction Buttons...");
    const buttonFiles = fs.readdirSync(TSDistPath+'/buttons').filter(file => file.endsWith('.js'))
    for (const file of buttonFiles) {
        const button = require(`./buttons/${file}`);
        logger.info(`import Button: ${button.button.customId}`);
        buttons.push(button);
    }    
})();

export { logger, config, client }; // bot.ts の変数共有用

async function debugGlobal() { // デバッグ用の変数
    setInterval(() => {
        const used = process.memoryUsage();
        const allMemoryLog = [];
        for (let key in used) {
            // @ts-ignore
            allMemoryLog.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
        }
    }, 5000); // 五秒ごとに確認
}

async function statusTask() {
    // client.user?.setStatus("idle");
    while (1) {
        let guildSize // https://discordjs.guide/sharding/#fetchclientvalues
        await client.shard?.fetchClientValues("guilds.cache.size")
            .then(results => {
                guildSize = results.reduce((acc, guildCount) => (acc as number) + (guildCount as number));
            });
        client.user?.setPresence({ activities: [{ name: `${guildSize} サーバー`, type: Discord.ActivityType.Competing }] });
        await sleep(10000);
        client.user?.setPresence({ activities: [{ name: `/help`, type: Discord.ActivityType.Listening }] });
        await sleep(5000);
    }
}

async function setSlashCommand() {
    // client.guilds.cache.forEach(async guild => {
    //     try{//すべてのサーバーのスラコマ設定 グローバルコマンドと違ってすぐに反映可能だが推奨ではない
    //         console.log(guild.name)
    //         // await guild.commands.set([]);
    //         // console.log(guild.name+" has been RESET")

    //         await guild.commands.set(slashCommand);
    //         console.log(guild.name+" has been set application command")
    //     }catch(e){
    //         console.log(e)//アプリケーションコマンド使えない招待や一日のクオーター制限等でコマンドが設定できない場合
    //     }
    // })
    
    logger.info("Global Guild set application command");
    await client.application!.commands.set(slashCommands);
    // await client.application!.commands.set([]); //reset 用
    logger.info("Global set application Ready!");
}

client.on("ready", async() => {
    logger.info(`Login to Discord with ${client.user?.username}`);
});

client.once("ready", async () => {
    debugGlobal();
    statusTask();
    // setSlashCommand();
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.member || !message.guild || !message.content.split(" ")[0].startsWith(config.prefix)) return;
    const [cmd, ...args] = message.content.slice(config.prefix.length).replace("　", " ").split(" ").filter(v => v != "");

    // Object.keys(commands).forEach((commandName) => {
    //     //@ts-ignore
    //     if (cmd == commandName || config.commands[commandName]?.includes(cmd)) commands[commandName].executeMessage(message);
    //     return;
    // });
    
    for(const commandName of Object.keys(commands)) {
        //@ts-ignore
        if (!(cmd == commandName || config.commands[commandName]?.includes(cmd))) continue;
        commands[commandName].executeMessage(message);
        return;
    };

    autoDeleteMessage(await message.reply(FormatERROR.message.NotfoundCommand));
    return;
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.guild || !interaction.member) return;
    if (interaction.isCommand()) {
        
        // Object.keys(commands).forEach(key => {
        //     console.log(key)
        // })
        if (interaction.commandName in commands) commands[interaction.commandName].executeInteraction(interaction);
        return;
    }
    
    if (interaction.isButton()) {
        const [cmd, ...values] = interaction.customId.split(":");

        // if (cmd in buttons) buttons[cmd].executeButton(interaction);
        buttons.forEach( (button) => {
            if (button.button.customId.includes(cmd)) button.executeButton(interaction);
        });
        return;
    }
});

client.login(config.token);