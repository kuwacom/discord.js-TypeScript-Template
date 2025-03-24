import env from '@configs/env';
import { ShardConnectionCountRes } from '@models/api/shardConnectionCount';
import logger from '@utils/logger';

export async function getShardConnectionCount(shardId: number) {
  try {
    const res = await fetch(
      env.shardSyncAPIAddress + `/shards/${shardId}/connectionCount`
    );
    if (!res.ok) return null;

    const data = (await res.json()) as ShardConnectionCountRes;
    return data;
  } catch (error) {
    logger.error(error);
    return null;
  }
}
