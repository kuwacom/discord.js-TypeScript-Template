import Discord from 'discord.js';

export const ToHelpButton = (
  num: number = 0,
  disabled: boolean = false
): Discord.ButtonBuilder => {
  return (
    new Discord.ButtonBuilder()
      .setCustomId(`helpBack:${num}`)
      .setLabel('/ スラッシュコマンドのヘルプはこちら')
      // .setEmoji()
      .setStyle(Discord.ButtonStyle.Success)
      .setDisabled(disabled)
  );
};

export const HelpBackButton = (
  num: number = 0,
  disabled: boolean = false
): Discord.ButtonBuilder => {
  return (
    new Discord.ButtonBuilder()
      .setCustomId(`helpBack:${num}`)
      .setLabel('<-')
      // .setEmoji()
      .setStyle(Discord.ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
};

export const HelpNextButton = (
  num: number = 0,
  disabled: boolean = false
): Discord.ButtonBuilder => {
  return (
    new Discord.ButtonBuilder()
      .setCustomId(`helpNext:${num}`)
      .setLabel('->')
      // .setEmoji()
      .setStyle(Discord.ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
};
