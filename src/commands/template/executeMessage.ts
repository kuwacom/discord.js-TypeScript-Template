import Discord from 'discord.js';
import { autoDeleteMessage } from '@services/discord';

export const executeMessage = async (message: Discord.Message) => {
  if (
    !message.guild ||
    !message.member ||
    !message.channel ||
    (message.channel.type != Discord.ChannelType.GuildText &&
      message.channel.type != Discord.ChannelType.GuildVoice)
  )
    return; // v14からステージチャンネルからだとsendできない
  // もしくは以下を使う
  if (!message.channel.isTextBased()) return;
  const sendMessage = await message.channel.send('This is a template command.');
  autoDeleteMessage(sendMessage);
  // messageCommand
};
