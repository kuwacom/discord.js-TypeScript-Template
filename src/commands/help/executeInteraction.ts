import Discord from 'discord.js';
import { commandsConfig, embedConfig } from '@configs/discord';
import { slashCommands } from '@services/discord';
import { DiscordCommandInteraction } from '@app-types/discord';
import { HelpBackButton, HelpNextButton } from '@/buttons/helpPaging';

export async function executeInteraction(
  interaction: DiscordCommandInteraction
) {
  if (!interaction.guild || !interaction.channel || !interaction.member) return;

  const baseFields: Discord.APIEmbedField[] = [];

  slashCommands.forEach((cmd) => {
    if (!cmd.options?.length) {
      baseFields.push({
        name: `/${cmd.name}`,
        value: cmd.description,
        inline: true,
      });
      return;
    }

    const first = cmd.options[0];
    if (first.type === 1 || first.type === 2) {
      // サブコマンド or グループ
      cmd.options.forEach((opt) => {
        if (opt.options?.some((o) => o.type === 1 || o.type === 2)) {
          opt.options?.forEach((_opt) => {
            baseFields.push({
              name: `/${cmd.name} ${opt.name} ${_opt.name}`,
              value: `${cmd.description}\n${opt.description}`,
              inline: true,
            });
          });
        } else {
          baseFields.push({
            name: `/${cmd.name} ${opt.name}`,
            value: `${cmd.description}\n${opt.description}`,
            inline: true,
          });
        }
      });
    } else {
      baseFields.push({
        name: `/${cmd.name}`,
        value: cmd.description,
        inline: true,
      });
    }
  });

  const pageSlice = 4;
  const pageCount = Math.ceil(baseFields.length / pageSlice);
  const currentFields = baseFields.slice(0, pageSlice);
  const disableBack = true;
  const disableNext = baseFields.length <= pageSlice;

  const buttonRow = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
    .addComponents(HelpBackButton(0, disableBack))
    .addComponents(HelpNextButton(1, disableNext));

  const embed = new Discord.EmbedBuilder()
    .setColor(embedConfig.colors.info)
    .setTitle(`-- SLASH COMMAND HELP - 1/${pageCount} --`)
    .setDescription(
      `**全 ${baseFields.length}個中 1~${currentFields.length} 個目**`
    )
    .setFields(currentFields)
    .setFooter({
      iconURL: interaction.user.avatarURL() ?? undefined,
      text: `${interaction.user.tag}\n${embedConfig.footerText}`,
    });

  await interaction.reply({
    embeds: [embed],
    components: [buttonRow],
    allowedMentions: { repliedUser: false },
  });
}
