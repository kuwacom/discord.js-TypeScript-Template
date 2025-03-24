import env from '@configs/env';
import { ShardConnectionCountReq } from '@models/api/shardConnectionCount';
import logger from '@utils/logger';

export async function setShardConnectionCount(
  shardId: number,
  connectionCount: number
) {
  try {
    const res = await fetch(
      env.shardSyncAPIAddress + `/shards/${shardId}/connectionCount`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionCount: connectionCount,
        } as ShardConnectionCountReq),
      }
    );

    if (!res.ok) return false;
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}
