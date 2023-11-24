import { DiscordButtonInteraction } from "../types/discord";
export const button = {
    customId: ["idone", "idsecond"]
}

export const executeButton = async (interaction: DiscordButtonInteraction) => {
    /**
     *  -- buttonの設定方法 --
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