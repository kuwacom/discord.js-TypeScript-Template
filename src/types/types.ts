import Discord from "discord.js";
import DiscordVoice from "@discordjs/voice";
import { config } from "../bot";

export const embedCollar = {
    info: config.embed.colors.info as Discord.ColorResolvable,
    success: config.embed.colors.success as Discord.ColorResolvable,
    warning: config.embed.colors.warning as Discord.ColorResolvable,
    error: config.embed.colors.error as Discord.ColorResolvable,
}

interface SlashCommandOption {
    name: string;
    description: string;
    required: boolean;
    type: number;
    options: SlashCommandOption[] | undefined;
}

export interface SlashCommand {
    name: string;
    description: string;
    options: SlashCommandOption[] | undefined;
}

export type DiscordCommandInteraction = Discord.ChatInputCommandInteraction<Discord.CacheType> | Discord.MessageContextMenuCommandInteraction<Discord.CacheType> | Discord.UserContextMenuCommandInteraction<Discord.CacheType>;
export interface Command {
    command: SlashCommand;
    executeMessage(message: Discord.Message): void;
    executeInteraction(interaction: DiscordCommandInteraction): void;
}

export type DiscordButtonInteraction = Discord.ButtonInteraction<Discord.CacheType>;
export interface Button {
    button: {
        customId: string[];
    },
    executeInteraction(interaction: DiscordButtonInteraction): void;
}

export type DiscordSelectMenuInteraction = Discord.StringSelectMenuInteraction<Discord.CacheType>;
export interface SelectMenu {
    selectMenu: {
        customId: string[];
    },
    executeInteraction(interaction: DiscordSelectMenuInteraction): void;
}

export type DiscordModalSubmitInteraction = Discord.ModalSubmitInteraction<Discord.CacheType>;
export interface Modal {
    modal: {
        customId: string[];
    },
    executeInteraction(interaction: DiscordModalSubmitInteraction): void;
}