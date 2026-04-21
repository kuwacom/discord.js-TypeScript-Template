import { commandsConfig } from '@/configs/discord';
import env from '@/configs/env';
import FormatError from '@/format/error';
import { autoDeleteMessage, commands } from '@/services/discord';
import logger from '@/services/logger';
import { Message, OmitPartialGroupDMChannel } from 'discord.js';

export default async function messageCreateHandler(
  message: OmitPartialGroupDMChannel<Message<boolean>>,
) {
  if (
    message.author.bot ||
    !message.member ||
    !message.guild ||
    !message.content.split(' ')[0].startsWith(env.bot.prefix)
  )
    return;

  logger.debug(
    `[messageCreateHandler] Received message: "${message.content}" from ${message.author.tag} in guild "${message.guild.name}"`,
  );

  const [cmd, ...args] = message.content
    .slice(env.bot.prefix.length)
    .replace('　', ' ')
    .split(' ')
    .filter((v) => v != '');

  // Object.keys(commands).forEach((commandName) => {
  //     //@ts-ignore
  //     if (cmd == commandName || config.commands[commandName]?.includes(cmd)) commands[commandName].executeMessage(message);
  //     return;
  // });

  for (const commandName of Object.keys(commands)) {
    if (!(cmd == commandName || (commandsConfig as any)[commandName]?.includes(cmd))) continue;
    commands[commandName].executeMessage(message);
    return;
  }

  autoDeleteMessage(await message.reply(FormatError.message.NotfoundCommand));
  return;
}
