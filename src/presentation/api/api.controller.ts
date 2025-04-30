import { Application, Request, Response } from 'express';
import { redisClient } from "../../config/redis.config";

export function initializeHttp(app: Application): void {

  'use strict';

  app.get('/', function (_req: Request, res: Response): void {
    res.send({ error: true, message: 'HEALTHY' });
  });

//   app.use('/event/rooms', authMiddleware);
  app.get('/rooms', async function (req: Request, res: Response): Promise<void> {
    const roomNumber: string = req.query.number as string;
    const eventRoomString: string | null  = await redisClient.get(`${roomNumber}`);
    if (!eventRoomString) {
      res.status(404).send({ error: true, message: 'ROOM NOT FOUND' });
      return;
    }
    res.send(eventRoomString);
  });

  app.get('/match-results', async function (req: Request, res: Response): Promise<void> {
    const roomNumber: string = req.query.room as string;
    const match: string = req.query.match as string;
    res.send(await redisClient.get(`${roomNumber}_${match}_RANKING_RESULT`) || '{}');
  });

  app.delete('/room-codes/:roomId', async function (req: Request, res: Response): Promise<void> {
    const roomId: string = req.params.roomId;
    const keys: string[] = await redisClient.keys(`${roomId}*`);
    const pipeline = redisClient.pipeline();
    keys.forEach((key) => {
      pipeline.del(key);
    });
    await pipeline.exec();
    // 방 삭제 완료
    res.send({ message: 'Room deleted successfully' });
  });

}