import { Socket, Server as SocketServer } from 'socket.io';
import { getSocketDataRoomNumber, getSocketDataUser } from '../../repository/socket/socket.repository';
import { handleEventFinishRankingGet, handleEventFinishScoreGet, handleEventFinishScorePost } from '../../application/event/event.finish.service';

export function onEventFinishScoreGet(
    _socketServer: SocketServer,
    socket: Socket
): void {
  socket.on('event.finish.score.get', async (req: any): Promise<void> => {
    const request: any = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber = getSocketDataRoomNumber(socket);
    await handleEventFinishScoreGet(roomNumber, req.match);
    socket.emit('event.finish.score.got'); // 웹에게 전체 점수
    _socketServer.to(roomNumber).emit('event.finish.score.got'); // 앱에게 전체 점수
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
    handleEventFinishRankingGet(roomNumber, user, request.match);
    socket.emit('event.finish.ranking.got');
  });
}

export interface EventFinishScorePostRequest {
  score: number;
  match: string;
}

export interface EventFinishRankingGetResponse {
  ranking: number;
}

export interface EventFinishRankingGetRequest {
  match: string;
}