import { SlashCommandBuilder } from 'discord.js';
import { executeMessage } from './executeMessage';
import { executeInteraction } from './executeInteraction';

export const command = new SlashCommandBuilder()
  .setName('help')
  .setDescription('コマンドの一覧と使い方を表示します');

export { executeMessage, executeInteraction };
