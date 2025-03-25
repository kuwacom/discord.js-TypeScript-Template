import express, { Request, Response, text } from 'express';
import { connectionCount } from '@/shardSyncAPI';
import bodyParser from 'body-parser';
const shardsRouter = express.Router();

shardsRouter.use(bodyParser.urlencoded({ extended: true }));
shardsRouter.use(bodyParser.json());

shardsRouter.get('/connectionCount', (req: Request, res: Response) => {
  if (Object.keys(connectionCount).length == 0)
    return res.status(200).json({
      shardCount: 0,
      connectionCount: 0,
    });

  const connectionCountNum = Object.values(connectionCount).reduce(
    (acc, curr) => acc + curr,
    0
  );
  return res.status(200).json({
    shardCount: Object.keys(connectionCount).length,
    connectionCount: connectionCountNum,
  });
});

shardsRouter.get('/:shardId/connectionCount', (req: Request, res: Response) => {
  const shardId = Number(req.params.shardId);
  if (!(shardId in connectionCount) || isNaN(shardId))
    return res.status(404).end();

  return res.status(200).json({
    shardCount: Object.keys(connectionCount).length,
    shardNum: shardId,
    connectionCount: connectionCount[shardId],
  });
});

shardsRouter.post(
  '/:shardId/connectionCount',
  (req: Request, res: Response) => {
    const shardId = Number(req.params.shardId);
    // const { shardNum, connectionCount } = req.body;
    if (!req.body) return res.status(400).end();
    const connectionCountNum = req.body.connectionCount as number;
    if (isNaN(connectionCountNum)) return res.status(400).end();

    connectionCount[shardId] = connectionCountNum;
    return res.status(200).json({
      success: true,
      message: 'Connection count updated successfully.',
    });
  }
);

shardsRouter.use((req, res, next) => {
  res.status(404).end();
});

export default shardsRouter;
