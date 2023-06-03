import { logger, config, client } from "../bot";
import * as Types from "../modules/types";
import Discord from "discord.js";

// import * as FormatButton from "../format/button"


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