import { logger, config, client } from "../bot";
import { autoDeleteMessage, sec2HHMMSS, sleep, slashCommands } from "../modules/utiles";
import * as Types from "../modules/types";
import * as FormatERROR from "../format/error";
import * as FormatButton from "../format/button";
import Discord from "discord.js";

export const button = {
    customId: ["helpNext", "helpBack"]
}

export const executeInteraction = async (interaction: Types.DiscordButtonInteraction) => {
    const [cmd, ...values] = interaction.customId.split(":");
    const guild = interaction.guild;
    if (!guild || !interaction.member) return;

    const baseFields: Discord.APIEmbedField[] = [];
    slashCommands.forEach((command) => {
        if (command.options) {
            if (command.options[0].type == 1 || command.options[0].type == 2) { // サブコマンドかサブコマンドグループ以外は普通にコマンド
                command.options.forEach((option) => {
                    if (option.options) {
                        if (option.options[0].type == 1 || option.options[0].type == 2) {
                            option.options?.forEach((_option) => {
                                baseFields.push({
                                    name: `/${command.name} ${option.name} ${_option.name}`,
                                    value: command.description+"\n"+
                                    option.description,
                                    inline: true
                                });
                            })
                            return;
                        }
                    }
                    baseFields.push({
                        name: `/${command.name} ${option.name}`,
                        value: command.description+"\n"+
                        option.description,
                        inline: true
                    });
                });
                return;
            } else {
                baseFields.push({
                    name: `/${command.name}`,
                    value: command.description,
                    inline: true
                });
            }
            return;
        } else {
            baseFields.push({
                name: `/${command.name}`,
                value: command.description,
                inline: true
            });
            return;
        }
    });

    const pageSlice = 4; // ページごとに表示する量
    const betweenFields = baseFields.slice(Number(values[0]) * pageSlice, (Number(values[0]) * pageSlice) + pageSlice);

    // 過去のボタン押したときとかで存在しないページの場合最初に戻す ヘルプ変えることなんてないからほぼない
    if (Number(values[0]) > (Math.ceil(baseFields.length / pageSlice) - 1)) values[0] = "0";

    let button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();
    if (Number(values[0]) == 0) {
        button.addComponents(FormatButton.HelpBack(0, true))
            .addComponents(FormatButton.HelpNext(Number(values[0]) + 1));
    } else if (Number(values[0]) == Math.ceil(baseFields.length / pageSlice) - 1) {
        button.addComponents(FormatButton.HelpBack(Number(values[0]) - 1))
            .addComponents(FormatButton.HelpNext(0, true));
    } else {
        button.addComponents(FormatButton.HelpBack(Number(values[0]) - 1))
            .addComponents(FormatButton.HelpNext(Number(values[0]) + 1));
    }

    const embeds = [
        new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.info)
            .setTitle(`-- SLASH COMMAND HELP - ${Number(values[0]) + 1}/${Math.ceil(baseFields.length / pageSlice)} --`)
            .setDescription("スラッシュコマンド一覧")
            .setDescription(
                `**全 ${baseFields.length}個中  ${(Number(values[0]) * pageSlice) + 1}~${(Number(values[0]) * pageSlice) + pageSlice}個目**`
            )
            .setFields(betweenFields)
            .setFooter({ iconURL: interaction.user.avatarURL() as string, text: `${interaction.user.username}#${interaction.user.discriminator}\n` +
            config.embed.footerText 
        })
    ];
    interaction.update({ embeds: embeds, components: [ button ], allowedMentions: { repliedUser: false } });
    return;
}