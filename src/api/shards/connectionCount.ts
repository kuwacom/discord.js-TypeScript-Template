import { isApiResultError } from '@lib/apiError';
import ShardsConnectionCountRes from '@models/api/shardsConnectionCount';
import { shardSyncApiClient } from '@/api/shardSyncApiClient';
import logger from '@/services/logger';

/**
 * ### getShardsConnectionCount
 * 全シャードの合計接続数を取得
 *
 * @returns 合計接続数、取得失敗時は null
 */
export async function getShardsConnectionCount(): Promise<number | null> {
  if (!shardSyncApiClient) return null;

  try {
    const data = await shardSyncApiClient.get<ShardsConnectionCountRes>(
      '/shards/connectionCount',
    );
    return data.connectionCount || null;
  } catch (error) {
    if (isApiResultError(error)) {
      logger.error(`Shards connection count 取得失敗: ${error.status} ${error.code}`, error);
    } else {
      logger.error('Shards connection count 取得中に例外発生', error);
    }
    return null;
  }
}
