import { Application, Request, Response } from 'express';
import { loggingTimeStamp, redisClient } from "../../config/redis.config";
import { getRoom } from '../../repository/common/room.repository';
import { ProcessRankingsResult } from '../../repository/event/entity/rankings.entity';
import { processRankingsNoTotalRankings } from '../../repository/event/event.ranking.repository';
import axios from 'axios';
import { KEY_RANKING_CALULATE_BY_API } from '../../util/redis_key_generator';

export function initializeHttp(app: Application): void {

  'use strict';

  app.get('/', function (_req: Request, res: Response): void {
    res.send({ error: true, message: 'HEALTHY' });
  });

  app.get('/rooms', async function (req: Request, res: Response): Promise<void> {
    const roomNumber: string = req.query.number as string;
    const eventRoomString: string | null = await redisClient.get(`${roomNumber}`);
    if (!eventRoomString) {
      res.status(404).send({ error: true, message: 'ROOM NOT FOUND' });
      return;
    }
    res.send(eventRoomString);
  });

  //
  app.get('/rooms/:roomNumber', async function (req: Request, res: Response): Promise<void> {
    const roomNumber: string = req.params.roomNumber;
    const roomString: string | null = await redisClient.get(`${roomNumber}`);
    const room = roomString ? JSON.parse(roomString) : null;
    if (!roomString) {
      res.status(404).send({ error: true, message: 'ROOM NOT FOUND' });
      return;
    }
    res.send({
      master: room.master,
      mode: room.mode,
      eventCode: null,
      placeCode: null,
      placeName: null,
    });
  });

  app.get('/match-results', async function (req: Request, res: Response): Promise<void> {
    res.send({ error: true, message: 'NOT IMPLEMENTED' });
  });

  app.get('/web/match-results', async function (req: Request, res: Response): Promise<void> {
    const roomNumber: string = req.query.room as string;
    const match: string = req.query.match as string;
    const matchNumber = parseInt(match);
    const result = await redisClient.get(`${roomNumber}_${match}_RANKING_RESULT`) || '';
    if (result == '') {
      const room = await getRoom(roomNumber);
      await loggingTimeStamp(KEY_RANKING_CALULATE_BY_API(roomNumber, match));
      const ranking: ProcessRankingsResult = await processRankingsNoTotalRankings(roomNumber, matchNumber, room.event?.eventTeams.map((team) => team.id) || []);

      // const bodyData = ranking.teamScore.map((teamScore) => {
      //   return {
      //     teamId: teamScore.id,
      //     totalUserScore: teamScore.averageScore,
      //   };
      // });

      // // backup/events/{eventId}/matches/{matchId}/team-scores 으로 POST
      // await axios.post(`https://lb5.tenten.games/v1/backup/matches/${matchNumber}/team-scores`,
      //   bodyData,
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );

      res.send(JSON.stringify(ranking));
    } else {
      res.send(result);
    }
  });

  app.delete('/room-codes/:roomId', async function (req: Request, res: Response): Promise<void> {
    const roomId: string = req.params.roomId;
    const keys: string[] = [];
    let cursor = '0';

    do {
      const result = await redisClient.scan(cursor, 'MATCH', `${roomId}*`, 'COUNT', 100);
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    // Pipeline으로 배치 삭제
    if (keys.length > 0) {
      const pipeline = redisClient.pipeline();
      keys.forEach((key) => {
        pipeline.del(key);
      });
      await pipeline.exec();
    }

    // 방 삭제 완료
    res.send({ message: 'Room deleted successfully', deletedKeys: keys.length });
  });

}