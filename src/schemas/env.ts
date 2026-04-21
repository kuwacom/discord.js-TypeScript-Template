import { z } from 'zod';

const truthyValues = ['true', '1', 'yes', 'on'];

export const envSchema = z
  .object({
    // BOT がメッセージコマンドで反応するプレフィックス
    BOT_PREFIX: z.string().min(1, 'BOT_PREFIX is required'),
    // Discord BOT のログイントークン
    BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
    // シャード同期 API の接続先 URL
    SHARD_SYNC_API_ADDRESSES: z
      .union([z.string().url(), z.literal('')])
      .optional()
      .default(''),
    // シャード同期 API をこのプロセスでホストするかどうか
    SHARD_SYNC_API_HOST: z.string().optional().default('false'),
    // シャード同期 API に許可する CORS Origin
    SHARD_SYNC_API_ORIGIN: z.string().optional().default('*'),
    // ビルド後の出力先ディレクトリ
    TS_DIST_PATH: z.string().optional().default('./dist'),
  })
  .superRefine((value, ctx) => {
    const shouldHostShardSyncAPI = truthyValues.includes(value.SHARD_SYNC_API_HOST.toLowerCase());

    if (shouldHostShardSyncAPI && !value.SHARD_SYNC_API_ADDRESSES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SHARD_SYNC_API_ADDRESSES'],
        message: 'SHARD_SYNC_API_ADDRESSES is required when SHARD_SYNC_API_HOST is enabled',
      });
    }
  })
  .transform((value) => ({
    bot: {
      prefix: value.BOT_PREFIX,
      token: value.BOT_TOKEN,
    },
    shardSyncAPIAddress: value.SHARD_SYNC_API_ADDRESSES,
    shardSyncAPIOrigin: value.SHARD_SYNC_API_ORIGIN,
    shouldHostShardSyncAPI: truthyValues.includes(value.SHARD_SYNC_API_HOST.toLowerCase()),
    tsDistPath: value.TS_DIST_PATH,
  }));

export type Env = z.infer<typeof envSchema>;
