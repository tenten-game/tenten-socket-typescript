import { Socket, Server as SocketServer } from 'socket.io';
import { NormalFinishScorePostRequest } from '../../application/normal/dto/request';
import { getSocketDataRoomNumber } from '../../repository/socket/socket.repository';

export function onNormalFinishScorePost(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.finish.score.post', async (req: any): Promise<void> => {
    const request: NormalFinishScorePostRequest = typeof req === 'string' ? JSON.parse(req) : req;
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.finish.score.posted', JSON.stringify(request));
  });
}

export function onNormalFinishExit(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.finish.exit', async (): Promise<void> => {
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.finish.exited');
  });
}
