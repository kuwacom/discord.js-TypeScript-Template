import { isApiResultError } from '@lib/apiError';
import { ShardConnectionCountReq, ShardConnectionCountRes } from '@models/api/shardConnectionCount';
import { shardSyncApiClient } from '@/api/shardSyncApiClient';
import logger from '@/services/logger';

/**
 * ### getShardConnectionCount
 * 特定シャードの接続数を取得
 *
 * @param shardId - シャードID
 * @returns シャード接続数情報、取得失敗時は null
 */
export async function getShardConnectionCount(
  shardId: number,
): Promise<ShardConnectionCountRes | null> {
  if (!shardSyncApiClient) return null;

  try {
    const data = await shardSyncApiClient.get<ShardConnectionCountRes>(
      `/shards/${shardId}/connectionCount`,
    );
    return data;
  } catch (error) {
    if (isApiResultError(error)) {
      logger.error(`Shard connection count 取得失敗: ${error.status} ${error.code}`, error);
    } else {
      logger.error('Shard connection count 取得中に例外発生', error);
    }
    return null;
  }
}

/**
 * ### setShardConnectionCount
 * 特定シャードの接続数を更新
 *
 * @param shardId - シャードID
 * @param connectionCount - 設定する接続数
 * @returns 更新成功時は true、失敗時は false
 */
export async function setShardConnectionCount(
  shardId: number,
  connectionCount: number,
): Promise<boolean> {
  if (!shardSyncApiClient) return false;

  try {
    await shardSyncApiClient.post<unknown, ShardConnectionCountReq>(
      `/shards/${shardId}/connectionCount`,
      {
        connectionCount,
      },
    );
    return true;
  } catch (error) {
    if (isApiResultError(error)) {
      logger.error(`Shard connection count 更新失敗: ${error.status} ${error.code}`, error);
    } else {
      logger.error('Shard connection count 更新中に例外発生', error);
    }
    return false;
  }
}
