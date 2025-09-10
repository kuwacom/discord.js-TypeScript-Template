import { buttons, commands, modals, selectMenus } from '@/services/discord';
import logger from '@/services/logger';
import { CacheType, Interaction } from 'discord.js';

export default async function interactionCreateHandler(
  interaction: Interaction<CacheType>
) {
  if (!interaction.guild || !interaction.member) return;

  logger.debug(`[DEBUG] Interaction received:`, {
    type: interaction.type,
    id: interaction.id,
    user: interaction.user?.tag,
    guild: interaction.guild?.id,
    customId: (interaction as any).customId,
    commandName: (interaction as any).commandName,
  });

  if (interaction.isCommand()) {
    // Object.keys(commands).forEach(key => {
    //     console.log(key)
    // })
    if (interaction.commandName in commands)
      commands[interaction.commandName].executeInteraction(interaction);
    return;
  } else if (interaction.isButton()) {
    const [cmd, ...values] = interaction.customId.split(':');

    buttons.forEach((button) => {
      if (button.button.customId.includes(cmd))
        button.executeInteraction(interaction);
    });
    return;
  } else if (interaction.isSelectMenu()) {
    const [cmd, ...values] = interaction.customId.split(':');

    selectMenus.forEach((selectMenu) => {
      if (selectMenu.selectMenu.customId.includes(cmd))
        selectMenu.executeInteraction(interaction);
    });
    return;
  } else if (interaction.isModalSubmit()) {
    const [cmd, ...values] = interaction.customId.split(':');

    modals.forEach((modal) => {
      if (modal.modal.customId.includes(cmd))
        modal.executeInteraction(interaction);
    });
    return;
  }
}
