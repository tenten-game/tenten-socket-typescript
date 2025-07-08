import { Socket, Server as SocketServer } from 'socket.io';
import { NormalFinishScorePostRequest } from '../../application/normal/dto/request';
import { getSocketDataRoomNumber, getSocketDataUser } from '../../repository/socket/socket.repository';
import { registerSocketEvent } from '../../util/error.handler';
import { safeParseJSON } from '../../util/validation';

export function onNormalFinishScorePost(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.finish.score.post', async (req: any): Promise<void> => {
    const request: NormalFinishScorePostRequest = safeParseJSON(req);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.finish.score.posted', JSON.stringify({
      userId: getSocketDataUser(socket).i,
      matchCode: request.matchCode,
      score: request.score
    }));
  });
}

export function onNormalFinishExit(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.finish.exit', async (): Promise<void> => {
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.finish.exited');
  });
}
