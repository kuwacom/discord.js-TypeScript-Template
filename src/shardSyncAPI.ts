import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { Logger } from 'tslog';
const logger = new Logger();

import shardsRouter from '@routes/shards';
import env from '@/configs/env';

const HostPort = (url: string) => {
  const parsedUrl = new URL(url);
  return [parsedUrl.hostname, parsedUrl.port];
};

export default function shardSyncAPI() {
  const app = express();
  app.use(cors({ origin: env.shardSyncAPIOrigin })); // cors 設定
  const [appHost, appPort] = HostPort(env.shardSyncAPIAddress);

  // restServer
  const mainRouter = express.Router();
  mainRouter.use('/shards', shardsRouter);
  app.use('/v1', mainRouter);

  app.use((req, res, next) => {
    res.status(404).end();
  });

  app.listen(Number(appPort), appHost, () => {
    logger.info(`Shard Sync API is running on: http://${appHost}:${appPort}`);
  });
}

const connectionCount: { [shardId: number]: number } = {};
export { connectionCount };
