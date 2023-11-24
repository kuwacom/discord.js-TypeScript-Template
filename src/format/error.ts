import Discord from "discord.js";
import emoji from "../configs/emoji";
import { embedConfig } from "../configs/discord";

namespace ErrorFormat {
        
    // interaction
    export const interaction = {
        // template一個目のエラー
        TemplateError: {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.error)
                .setTitle(emoji.error+"エラー")
                .setDescription("エラーです")
                .setFooter({ text: embedConfig.footerText })
            ],
            ephemeral: true
        } as Discord.InteractionReplyOptions,

        // template二個目のエラー
        TemplateError2: (text: string): Discord.InteractionReplyOptions => {
            return {
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(embedConfig.colors.error)
                    .setTitle(emoji.error+"エラー")
                    .setDescription(text)
                    .setFooter({ text: embedConfig.footerText })
                ],
                ephemeral: true
            };
        }
    }

    // message
    export const message = {
        // textCommandに対応してないとき
        NotSupportTextCommand: {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.error)
                .setTitle(emoji.error+"エラー")
                .setDescription(
                    "このコマンドはテキストコマンドに対応していません！"
                )
                .setFooter({ text: embedConfig.footerText })
            ],
            allowedMentions: {
                repliedUser: true
            }
        } as Discord.MessageReplyOptions,
        
        // 引数ないとき
        NoArg: {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.warning)
                .setTitle(emoji.error+"エラー")
                .setDescription("**引数を入力してください**")
                .setFooter({ text: embedConfig.footerText })
            ],
            allowedMentions: {
                repliedUser: true
            }
        } as Discord.MessageReplyOptions,

        // コマンドがないとき
        NotfoundCommand: {
            embeds: [
                new Discord.EmbedBuilder()
                .setColor(embedConfig.colors.error)
                .setTitle(emoji.error+"エラー")
                .setDescription(
                    "**コマンドが見つかりません**"
                    )
                .setFooter({ text: embedConfig.footerText })
            ],
            allowedMentions: {
                repliedUser: true
            }
        } as Discord.MessageReplyOptions,
    }
}
export default ErrorFormat;