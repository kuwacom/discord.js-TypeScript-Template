import { DiscordModalSubmitInteraction } from "../types/discord";

export const modal = {
    customId: ["idone", "idsecond"]
}

export const executeInteraction = async (interaction: DiscordModalSubmitInteraction) => {
    /**
     *  -- modalの設定方法 --
     * 
     * cmd: コマンド名
     * values: 値(array)
     * 
     * button登録時に customId で
     * {コマンド名}:{値}:{値}...
     * のように設定していく
     */
    const [cmd, ...values] = interaction.customId.split(":");

    return;
}