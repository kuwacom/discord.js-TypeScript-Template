import Discord from 'discord.js';
import { commandsConfig, embedConfig } from '@configs/discord';
import env from '@configs/env';
import { slashCommands } from '@services/discord';
import { ToHelpButton } from '@/buttons/helpPaging';

export async function executeMessage(message: Discord.Message) {
  if (!message.guild) return;
  if (!message.member) return;
  console.log(message.channel.type);
  if (
    message.channel.type != Discord.ChannelType.GuildText &&
    message.channel.type != Discord.ChannelType.GuildVoice
  )
    return;

  const fields: Discord.APIEmbedField[] = [];
  slashCommands.forEach((cmd) => {
    if (cmd.name in commandsConfig) {
      fields.push({
        name: `${env.bot.prefix}${cmd.name}`,
        value: cmd.description,
        inline: true,
      });
    }
  });

  await message.delete().catch(() => {});

  const buttonRow = new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
    ToHelpButton(0),
  );

  const embed = new Discord.EmbedBuilder()
    .setColor(embedConfig.colors.info)
    .setTitle('-- TEXT COMMAND HELP --')
    .setDescription('テキストコマンド一覧')
    .setFields(fields)
    .setFooter({
      iconURL: message.author.avatarURL() ?? undefined,
      text: `${message.author.tag}\n${embedConfig.footerText}`,
    });

  await message.channel.send({
    embeds: [embed],
    components: [buttonRow],
    allowedMentions: { repliedUser: false },
  });
}
