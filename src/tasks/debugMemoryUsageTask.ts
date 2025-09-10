import { getShardId } from '@/services/discord';
import logger from '@/services/logger';

export default async function debugMemoryUsageTask(intervalMs: number = 5000) {
  const logMemoryUsage = () => {
    const used = process.memoryUsage();
    const allMemoryLog = Object.entries(used).map(
      ([key, value]) =>
        `${key}: ${Math.round((value / 1024 / 1024) * 100) / 100} MB`
    );
    logger.debug(
      `\n-=-=-=-=-=-=-=-= Shard Id - ${getShardId()} -=-=-=-=-=-=-=-=\n` +
        allMemoryLog.join(' : ') +
        '\n'
    );
  };

  setInterval(logMemoryUsage, intervalMs);
}
