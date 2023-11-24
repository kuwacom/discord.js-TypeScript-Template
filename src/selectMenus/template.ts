import Discord from "discord.js";
import { DiscordSelectMenuInteraction } from "../types/discord";

export const selectMenu = {
    customId: ["idone", "idsecond"]
}

export const executeInteraction = async (interaction: DiscordSelectMenuInteraction) => {
    /**
     *  -- selectMenuの設定方法 --
     * 
     * cmd: コマンド名
     * values: 値(array)
     * 
     * button登録時に customId で
     * {コマンド名}:{値}:{値}...
     * のように設定していく
     */
    const [cmd, ...values] = interaction.customId.split(":");
    console.log(interaction.values)
    
    return;
}