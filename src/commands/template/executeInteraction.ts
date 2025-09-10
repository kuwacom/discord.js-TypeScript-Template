import Discord from 'discord.js';
import { autoDeleteMessage } from '@services/discord';
import { DiscordCommandInteraction } from '@app-types/discord';
import logger from '@/services/logger';

export const executeInteraction = async (
  interaction: DiscordCommandInteraction
) => {
  logger.info(`/${interaction.commandName} by ${interaction.user.tag}`);
  if (
    !interaction.guild ||
    !interaction.member ||
    !interaction.channel ||
    !interaction.isChatInputCommand()
  )
    return; // v14からステージチャンネルからだとsendできない
  // もしくは以下を使う
  if (!interaction.channel.isTextBased()) return;

  const sendMessage = await interaction.reply('This is a template command.');
  autoDeleteMessage(sendMessage);
  // interactionCommand
};
