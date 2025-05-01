import { Application, Request, Response } from 'express';
import { redisClient } from "../../config/redis.config";
import { getRoom } from '../../repository/common/room.repository';
import { ProcessRankingsResult } from '../../repository/event/entity/rankings.entity';
import { processRankingsNoTotalRankings } from '../../repository/event/event.ranking.repository';

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
    const matchNumber = parseInt(match);
    const result = await redisClient.get(`${roomNumber}_${match}_RANKING_RESULT`) || '';
    console.log(`roomNumber = ${roomNumber}`);
    console.log(`matchNumber = ${matchNumber}`);
    console.log(`result = ${result}`);
    if (result == '') {
      const room = await getRoom(roomNumber);
      const ranking: ProcessRankingsResult = await processRankingsNoTotalRankings(roomNumber, matchNumber, room.event?.eventTeams.map((team) => team.id) || []);
      console.log(JSON.stringify(ranking));
      res.send(JSON.stringify(ranking));
    } else {
      console.log(`result = ${result}`);
      res.send(result);
    }
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