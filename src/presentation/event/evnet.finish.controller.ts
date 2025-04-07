import { Socket, Server as SocketServer } from 'socket.io';
import EventFinishScoreGetRequest, { EventFinishRankingGetRequest, EventFinishScorePostRequest } from '../../application/event/dto/event.finish.dto';
import { handleEventFinishRankingGet, handleEventFinishScoreGet, handleEventFinishScorePost } from '../../application/event/event.finish.service';
import { ProcessRankingsResult } from '../../repository/event/entity/rankings.entity';
import { getSocketDataRoomNumber, getSocketDataUser } from '../../repository/socket/socket.repository';

export function onEventFinishScoreGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.finish.score.get', async (req: any): Promise<void> => {
    const request: EventFinishScoreGetRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const rankings: ProcessRankingsResult = await handleEventFinishScoreGet(roomNumber, request.match);

    socket.emit('event.finish.score.got', JSON.stringify(rankings)); // 웹에게 전체 점수
    _socketServer.to(roomNumber).emit('event.finish.score.got', JSON.stringify({
      winTeamId: rankings.winTeamId,
      teamScore: rankings.teamScore,
      teamTopRankings: rankings.teamTopRankings,
      teamBottomRankings: rankings.teamBottomRankings,
      totalTopRankings: rankings.totalTopRankings,
      totalBottomRankings: rankings.totalBottomRankings,
    })); // 앱에게 핵심 점수
  });
}

export function onEventFinishExit(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.finish.exit', async (req: any): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);
    _socketServer.to(roomNumber).emit('event.finish.exited');
  });
}

export function onEventFinishScorePost(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.finish.score.post', async (req: any): Promise<void> => {
    const request: EventFinishScorePostRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const user = getSocketDataUser(socket);
    const roomNumber = getSocketDataRoomNumber(socket);
    handleEventFinishScorePost(request, roomNumber, user);
    socket.emit('event.finish.ranking.got');
  });
}

export function onEventFinishRankingGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.finish.ranking.get', async (req: any): Promise<void> => {
    const request: EventFinishRankingGetRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber = getSocketDataRoomNumber(socket);
    const user = getSocketDataUser(socket);
    const myRanking = await handleEventFinishRankingGet(roomNumber, user, request.match);
    socket.emit('event.finish.ranking.got', JSON.stringify({ ranking: myRanking }));
  });
}
