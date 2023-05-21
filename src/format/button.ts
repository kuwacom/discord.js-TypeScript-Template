import { logger, config, client } from "../index";
import * as Types from "../modules/types";
import Discord from "discord.js";

// import * as FormatButton from "../format/button"

// メインパネル
export const Template = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    if (num == 0) {
        return new Discord.ButtonBuilder()
        .setCustomId(`template:0`)
        // .setLabel(config.emoji.panel.play)
        .setEmoji(config.emoji.customPanel.play)
        .setStyle(Discord.ButtonStyle.Success)
        .setDisabled(disabled)
    } else {
        return new Discord.ButtonBuilder()
        .setCustomId(`template:1`)
        // .setLabel(config.emoji.panel.pause)
        .setEmoji(config.emoji.customPanel.pause)
        .setStyle(Discord.ButtonStyle.Success)
        .setDisabled(disabled)
    }
}


// ヘルプパネル

export const ToHelp = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`helpBack:${num}`)
    .setLabel("/ スラッシュコマンドのヘルプはこちら")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Success)
    .setDisabled(disabled)
}

export const HelpBack = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`helpBack:${num}`)
    .setLabel("<-")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}

export const HelpNext = (num: number = 0, disabled: boolean = false): Discord.ButtonBuilder => {
    return new Discord.ButtonBuilder()
    .setCustomId(`helpNext:${num}`)
    .setLabel("->")
    // .setEmoji()
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(disabled)
}