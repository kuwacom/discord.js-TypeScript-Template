import Discord from 'discord.js';

export const TemplateButton = (
  num: number = 0,
  disabled: boolean = false
): Discord.ButtonBuilder => {
  return (
    new Discord.ButtonBuilder()
      .setCustomId(`helpBack:${num}`)
      .setLabel('テンプレートボタンです')
      // .setEmoji()
      .setStyle(Discord.ButtonStyle.Success)
      .setDisabled(disabled)
  );
};
