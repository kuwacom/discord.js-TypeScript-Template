export type ShardConnectionCountRes = {
  shardCount: number;
  shardNum: number;
  connectionCount: number;
};

export type ShardConnectionCountReq = {
  connectionCount: number;
};
