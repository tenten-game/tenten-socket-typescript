import { Socket, Server as SocketServer } from 'socket.io';
import { EventFinishRankingGetRequest, EventFinishScoreGetRequest, EventFinishScorePostRequest } from '../../application/event/dto/request';
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

    socket.emit('event.finish.score.got.host', JSON.stringify(rankings)); // 웹에게 전체 점수

    // 앱에게 필요없는 점수는 제외
    rankings.totalRankings = []; 
    rankings.teamTopRankings = {};
    rankings.teamBottomRankings = {};

    _socketServer.to(roomNumber).emit('event.finish.score.got', JSON.stringify(rankings)); // 앱에게 핵심 점수
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
    handleEventFinishScorePost(request, getSocketDataRoomNumber(socket), getSocketDataUser(socket));
    socket.emit('event.finish.score.posted');
  });
}

export function onEventFinishRankingGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.finish.ranking.get', async (req: any): Promise<void> => {
    const request: EventFinishRankingGetRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const myRanking: number = await handleEventFinishRankingGet(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request.match);
    socket.emit('event.finish.ranking.got', JSON.stringify({ ranking: myRanking }));
  });
}
