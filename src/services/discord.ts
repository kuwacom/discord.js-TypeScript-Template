import Discord, { Client } from 'discord.js';
import fs from 'fs';
import { Button, Command, Modal, SelectMenu, SlashCommand } from '@app-types/discord';
import { sleep } from '@/utils/utiles';
import logger from './logger';
import env from '@/configs/env';

// Statusをスマホアイコンにする
// (Discord.DefaultWebSocketManagerOptions.identifyProperties.browser as any) = "Discord iOS"

export const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
  ],
});

const TSDistPath = env.tsDistPath;

export const slashCommands: SlashCommand[] = [];
export const commands: { [commandName: string]: Command } = {};
export const buttons: Button[] = [];
export const selectMenus: SelectMenu[] = [];
export const modals: Modal[] = [];

// npm test 等一番上のディレクトリで実行する際
// ./dist/ になるためcommands に dist を追加する必要あり
export const initCommands = async () => {
  // Load Commands
  logger.info('Loading Commands...');
  const commandDirs = fs
    .readdirSync(`${TSDistPath}/commands`, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let commandFiles: string[] = [];
  commandDirs.forEach((dir) => {
    const indexPath = `${TSDistPath}/commands/${dir}`;
    if (fs.existsSync(indexPath)) {
      commandFiles.push(`${dir}`);
    }
  });

  commandFiles.forEach((file) => {
    const command: Command = require(`../commands/${file}`);
    logger.info(`import Command: ${command.command.name}`);
    commands[command.command.name] = command;
    slashCommands.unshift(command.command);
  });
};
export const initButtons = async () => {
  // Load Buttons
  logger.info('Loading Interaction Buttons...');
  const buttonDirs = fs
    .readdirSync(`${TSDistPath}/buttons`, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let buttonFiles: string[] = [];
  buttonDirs.forEach((dir) => {
    const indexPath = `${TSDistPath}/buttons/${dir}`;
    if (fs.existsSync(indexPath)) {
      buttonFiles.push(`${dir}`);
    }
  });

  buttonFiles.forEach((file) => {
    const button: Button = require(`../buttons/${file}`);
    logger.info(`import Button: ${button.button.customId}`);
    buttons.push(button);
  });
};
export const initSelectMenus = async () => {
  // Load SelectMenus
  logger.info('Loading Interaction SelectMenus...');
  const selectMenuDirs = fs
    .readdirSync(`${TSDistPath}/selectMenus`, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let selectMenuFiles: string[] = [];
  selectMenuDirs.forEach((dir) => {
    const indexPath = `${TSDistPath}/selectMenus/${dir}`;
    if (fs.existsSync(indexPath)) {
      selectMenuFiles.push(`${dir}`);
    }
  });

  selectMenuFiles.forEach((file) => {
    const selectMenu: SelectMenu = require(`../selectMenus/${file}`);
    logger.info(`import SelectMenu: ${selectMenu.selectMenu.customId}`);
    selectMenus.push(selectMenu);
  });
};
export const initModals = async () => {
  // Load Modals
  logger.info('Loading Interaction Modals...');
  const modalDirs = fs
    .readdirSync(`${TSDistPath}/modals`, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let modalFiles: string[] = [];
  modalDirs.forEach((dir) => {
    const indexPath = `${TSDistPath}/modals/${dir}`;
    if (fs.existsSync(indexPath)) {
      modalFiles.push(`${dir}`);
    }
  });

  modalFiles.forEach((file) => {
    const modal: Modal = require(`../modals/${file}`);
    logger.info(`import Modal: ${modal.modal.customId}`);
    modals.push(modal);
  });
};

export async function initBot() {
  // Load Commands
  initCommands();
  initButtons();
  initSelectMenus();
  initModals();

  // Login
  await client.login(env.bot.token);
}

export async function setSlashCommand() {
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

  logger.info('Global Guild set application command');
  await client.application!.commands.set(slashCommands);
  // await client.application!.commands.set([]); //reset 用
  logger.info('Global set application Ready!');
}

// Utils

export const autoDeleteMessage = async (
  message: Discord.Message | Discord.InteractionResponse,
  msec: number = 10000,
) => {
  await sleep(msec);
  message.delete();
};

export const getShardId = () => Array.from(client.guilds.cache.values())[0].shardId;

export async function getTotalGuildCount(client: Client): Promise<number> {
  if (!client.shard) return client.guilds.cache.size;
  const counts = await client.shard.fetchClientValues('guilds.cache.size');
  return (counts as number[]).reduce((sum, v) => sum + v, 0);
}
