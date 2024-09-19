import Discord from "discord.js";
import fs from "fs";
import { sleep, sec2HHMMSS, randRange } from "./utils/utiles";
import client from "./discord";
import logger from "./utils/logger";
import { Button, Command, Modal, SelectMenu } from "./types/discord";
import env from "./configs/env";
import { autoDeleteMessage, buttons, commands, getShardId, modals, selectMenus, slashCommands } from "./utils/discord";
import ErrorFormat from "./format/error";
import { commandsConfig } from "./configs/discord";

// エラーハンドリング
process.on("uncaughtException", (err) => {
    logger.error(err.toString());
});

// npm test 等一番上のディレクトリで実行する際
// ./dist/ になるためcommands に dist を追加する必要あり
const TSDistPath = "./dist";
(async () => { // Load Commands
    logger.info("Loading Commands...");
    const commandFiles = fs.readdirSync(TSDistPath+'/commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command: Command = require(`./commands/${file}`);
        logger.info(`import Command: ${command.command.name}`);
        commands[command.command.name] = command;
        slashCommands.unshift(command.command)
    } 
})();
(async () => { // Load Buttons
    logger.info("Loading Interaction Buttons...");
    const buttonFiles = fs.readdirSync(TSDistPath+'/buttons').filter(file => file.endsWith('.js'))
    for (const file of buttonFiles) {
        const button: Button = require(`./buttons/${file}`);
        logger.info(`import Button: ${button.button.customId}`);
        buttons.push(button);
    }    
})();
(async () => { // Load SelectMenus
    logger.info("Loading Interaction SelectMenus...");
    const selectMenuFiles = fs.readdirSync(TSDistPath+'/selectMenus').filter(file => file.endsWith('.js'))
    for (const file of selectMenuFiles) {
        const selectMenu: SelectMenu = require(`./selectMenus/${file}`);
        logger.info(`import SelectMenu: ${selectMenu.selectMenu.customId}`);
        selectMenus.push(selectMenu);
    }    
})();
(async () => { // Load Modals
    logger.info("Loading Interaction Modals...");
    const modalFiles = fs.readdirSync(TSDistPath+'/modals').filter(file => file.endsWith('.js'))
    for (const file of modalFiles) {
        const modal: Modal = require(`./modals/${file}`);
        logger.info(`import Modal: ${modal.modal.customId}`);
        modals.push(modal);
    }    
})();

async function debugGlobal() { // デバッグ用の変数
    setInterval(() => {
        const used = process.memoryUsage();
        const allMemoryLog = [];
        for (let key in used) {
            // @ts-ignore
            allMemoryLog.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
        }
        logger.debug(`\n-=-=-=-=-=-=-=-= Shard Id - ${getShardId()} -=-=-=-=-=-=-=-=\n` +
        allMemoryLog.join(' : ') + '\n');
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
    setSlashCommand();
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.member || !message.guild || !message.content.split(" ")[0].startsWith(env.bot.prefix)) return;
    const [cmd, ...args] = message.content.slice(env.bot.prefix.length).replace("　", " ").split(" ").filter(v => v != "");

    // Object.keys(commands).forEach((commandName) => {
    //     //@ts-ignore
    //     if (cmd == commandName || config.commands[commandName]?.includes(cmd)) commands[commandName].executeMessage(message);
    //     return;
    // });
    
    for(const commandName of Object.keys(commands)) {
        if (!(cmd == commandName || (commandsConfig as any)[commandName]?.includes(cmd))) continue;
        commands[commandName].executeMessage(message);
        return;
    };

    autoDeleteMessage(await message.reply(ErrorFormat.message.NotfoundCommand));
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
    }else if (interaction.isButton()) {
        const [cmd, ...values] = interaction.customId.split(":");

        buttons.forEach((button) => {
            if (button.button.customId.includes(cmd)) button.executeInteraction(interaction);
        });
        return;
    } else if (interaction.isSelectMenu()) {
        const [cmd, ...values] = interaction.customId.split(":");

        selectMenus.forEach((selectMenu) => {
            if (selectMenu.selectMenu.customId.includes(cmd)) selectMenu.executeInteraction(interaction);
        });
        return;
    } else if (interaction.isModalSubmit()) {
        const [cmd, ...values] = interaction.customId.split(":");

        modals.forEach((modal) => {
            if (modal.modal.customId.includes(cmd)) modal.executeInteraction(interaction);
        });
        return;
    }
});

client.login(env.bot.token);