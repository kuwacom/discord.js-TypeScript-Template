import { embedConfig } from '@/configs/discord';
import { slashCommands } from '@/services/discord';
import { DiscordButtonInteraction } from '@/types/discord';
import { ActionRowBuilder, APIEmbedField, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { HelpBackButton, HelpNextButton } from './builders';

export const executeInteraction = async (interaction: DiscordButtonInteraction) => {
  const [cmd, ...values] = interaction.customId.split(':');
  const guild = interaction.guild;
  if (!guild || !interaction.member) return;

  const baseFields: APIEmbedField[] = [];
  slashCommands.forEach((command) => {
    if (command.options?.length) {
      if (command.options[0].type == 1 || command.options[0].type == 2) {
        // サブコマンドかサブコマンドグループ以外は普通にコマンド
        command.options.forEach((option) => {
          if (option.options) {
            if (option.options[0].type == 1 || option.options[0].type == 2) {
              option.options?.forEach((_option) => {
                baseFields.push({
                  name: `/${command.name} ${option.name} ${_option.name}`,
                  value: command.description + '\n' + option.description,
                  inline: true,
                });
              });
              return;
            }
          }
          baseFields.push({
            name: `/${command.name} ${option.name}`,
            value: command.description + '\n' + option.description,
            inline: true,
          });
        });
        return;
      } else {
        baseFields.push({
          name: `/${command.name}`,
          value: command.description,
          inline: true,
        });
      }
      return;
    } else {
      baseFields.push({
        name: `/${command.name}`,
        value: command.description,
        inline: true,
      });
      return;
    }
  });

  const pageSlice = 4; // ページごとに表示する量
  const betweenFields = baseFields.slice(
    Number(values[0]) * pageSlice,
    Number(values[0]) * pageSlice + pageSlice,
  );

  // ページ範囲外なら最初のページに戻す
  if (Number(values[0]) > Math.ceil(baseFields.length / pageSlice) - 1) values[0] = '0';

  const currentPage = Number(values[0]);
  const maxPage = Math.ceil(baseFields.length / pageSlice) - 1;

  const disableBack = currentPage === 0;
  const disableNext = currentPage === maxPage && baseFields.length <= pageSlice;

  const button = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(HelpBackButton(disableBack ? 0 : currentPage - 1, disableBack))
    .addComponents(HelpNextButton(disableNext ? 0 : currentPage + 1, disableNext));

  const embeds = [
    new EmbedBuilder()
      .setColor(embedConfig.colors.info)
      .setTitle(
        `-- SLASH COMMAND HELP - ${Number(values[0]) + 1}/${Math.ceil(
          baseFields.length / pageSlice,
        )} --`,
      )
      .setDescription('スラッシュコマンド一覧')
      .setDescription(
        `**全 ${baseFields.length}個中  ${Number(values[0]) * pageSlice + 1}~${
          Number(values[0]) * pageSlice + pageSlice
        }個目**`,
      )
      .setFields(betweenFields)
      .setFooter({
        iconURL: interaction.user.avatarURL() as string,
        text:
          `${interaction.user.username}#${interaction.user.discriminator}\n` +
          embedConfig.footerText,
      }),
  ];
  interaction.update({
    embeds: embeds,
    components: [button],
    allowedMentions: { repliedUser: false },
  });
  return;
};
