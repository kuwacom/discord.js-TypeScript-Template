import Discord, { SlashCommandBuilder } from 'discord.js';
import { DiscordCommandInteraction } from '@app-types/discord';

export const command = new SlashCommandBuilder()
  .setName('template')
  .setDescription('テンプレート');

export const executeMessage = async (message: Discord.Message) => {
  if (
    !message.guild ||
    !message.member ||
    message.channel.type == Discord.ChannelType.GuildStageVoice
  )
    return; // v14からステージチャンネルからだとsendできない
  // messageCommand
};

export const executeInteraction = async (
  interaction: DiscordCommandInteraction
) => {
  if (
    !interaction.guild ||
    !interaction.channel ||
    !interaction.member ||
    !interaction.isChatInputCommand()
  )
    return;
  // interactionCommand
};
