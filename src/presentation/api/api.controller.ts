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
    res.send(eventRoomString);
  });

  app.get('/match-results', async function (req: Request, res: Response): Promise<void> {
    const roomNumber: string = req.query.roomNumber as string;
    const match: string = req.query.match as string;
    res.send(await redisClient.get(`${roomNumber}_${match}_RANKING_RESULT`) || '{}');
  });

}