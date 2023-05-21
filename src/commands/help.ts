import { logger, config, client } from "../index";
import { sleep, slashCommands } from "../modules/utiles";
import * as Types from "../modules/types";
import Discord from "discord.js";

import * as FormatERROR from "../format/error";
import * as FormatButton from "../format/button";

export const command = {
    name: "help",
    description: "コマンドの一覧と使い方を表示します"
}


export const executeMessage = async (message: Discord.Message) => {
    if (!message.guild) return;
    if (!message.member) return;
    if (message.channel.type == Discord.ChannelType.GuildStageVoice) return; // なんかv14からステージチャンネルからだとsendできないからこれ
    
    const fields: Discord.APIEmbedField[] = [];

    slashCommands.forEach((command) => {
        if (command.name in config.commands) {
            fields.push({
                name: `${config.prefix}${command.name}`,
                value: command.description,
                inline: true
            })
        }    
    })

    message.delete();
    
    const button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
        .addComponents(FormatButton.ToHelp(0)) // スラコマ表示用ボタン

    const embeds = [
        new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.info)
            .setTitle("-- TEXT COMMAND HELP --")
            .setDescription("テキストコマンド一覧")
            .setFields(fields)
            .setFooter({ iconURL: message.author.avatarURL() as string, text: `${message.author.username}#${message.author.discriminator}\n` +
                config.embed.footerText 
            })
    ];

    message.channel.send({ embeds: embeds, components: [ button ], allowedMentions: { repliedUser: false } });
    return;
}

export const executeInteraction = async (interaction: Discord.CommandInteraction) => {
    if (!interaction.guild || !interaction.channel || !interaction.member || !interaction.isChatInputCommand()) return;
    
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
    const betweenFields = baseFields.slice(0, pageSlice);

    let button = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
        .addComponents(FormatButton.HelpBack(0, true))
        .addComponents(FormatButton.HelpNext(1));

    const embeds = [
        new Discord.EmbedBuilder()
            .setColor(Types.embedCollar.info)
            .setTitle(`-- SLASH COMMAND HELP - 1/${Math.ceil(baseFields.length / pageSlice)} --`)
            .setDescription("スラッシュコマンド一覧")
            .setDescription(
                `**全 ${baseFields.length}個中  1~${pageSlice}個目**`
            )
            .setFields(betweenFields)
            .setFooter({ iconURL: interaction.user.avatarURL() as string, text: `${interaction.user.username}#${interaction.user.discriminator}\n` +
            config.embed.footerText 
        })
    ];
    interaction.reply({ embeds: embeds, components: [ button ], allowedMentions: { repliedUser: false } });
    return;
}