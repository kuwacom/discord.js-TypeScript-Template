import env from '@configs/env';
import ShardsConnectionCount from '@models/api/shardsConnectionCount';
import logger from '@utils/logger';

export async function getShardsConnectionCount() {
  try {
    const res = await fetch(
      env.shardSyncAPIAddress + '/shards/connectionCount'
    );
    if (!res.ok) return null;

    const data = (await res.json()) as ShardsConnectionCount;
    return data.connectionCount || null;
  } catch (error) {
    logger.error(error);
    return null;
  }
}
2;
