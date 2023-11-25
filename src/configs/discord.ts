import Discord from "discord.js";

export const BOTVersion = "3.0"

// npm test 等1番上のディレクトリで実行する際
// ./dist/ になるためcommands に dist を追加する必要あり
export const TSDistPath = "./dist";

export const commandsConfig = {
    help:["help", "h"]
}

export const slashCommandsConfig = {
    help: "`/help`"
}

export const embedConfig = {
    footerText: "Create&Powered BY kuwa.app - V"+BOTVersion,
    colors: {
        info: "#87ceeb" as Discord.ColorResolvable,
        success: "#00fa9a" as Discord.ColorResolvable,
        warning: "#ffa500" as Discord.ColorResolvable,
        error: "#ff0000" as Discord.ColorResolvable
    }
}