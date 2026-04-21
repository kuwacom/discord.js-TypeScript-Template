import { SlashCommandBuilder } from 'discord.js';
import { executeMessage } from './executeMessage';
import { executeInteraction } from './executeInteraction';

export const command = new SlashCommandBuilder().setName('template').setDescription('テンプレート');

export { executeMessage, executeInteraction };
