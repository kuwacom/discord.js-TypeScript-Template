import env from '@configs/env';
import { APIClient } from '@/api/apiClient';

// SHARD_SYNC_API_ADDRESSES が空の場合はインスタンスを生成しない
export const shardSyncApiClient = env.shardSyncAPIAddress
  ? new APIClient({
      baseUrl: env.shardSyncAPIAddress,
      timeout: 10000,
    })
  : null;
