import { client, initBot } from '@services/discord';
import logger from '@/services/logger';
import env from '@configs/env';
import messageCreateHandler from './handlers/messageCreateHandler';
import interactionCreateHandler from './handlers/interactionCreateHandler';
import debugMemoryUsageTask from './tasks/debugMemoryUsageTask';
import discordStatusTask from './tasks/discordStatusTask';
import { isDev } from './configs/args';

// エラーハンドリング
if (!isDev) {
  // process.on('uncaughtException', (err) => {
  //   logger.error(err.toString());
  // });
}

client.on('ready', async () => {
  logger.info(`Login to Discord with ${client.user?.username}`);
});

client.once('ready', async () => {
  debugMemoryUsageTask();
  discordStatusTask();
  // setSlashCommand();
});

client.on('messageCreate', messageCreateHandler);
client.on('interactionCreate', interactionCreateHandler);

initBot();
