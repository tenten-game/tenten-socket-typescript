import { Socket, Server as SocketServer } from 'socket.io';
import { NormalFinishScorePostRequest } from '../../application/normal/dto/request';
import { getSocketDataRoomNumber, getSocketDataUser } from '../../repository/socket/socket.repository';
import { safeParseJSON } from '../../util/validation';
import { sendGoogleChatMessage } from '../../util/webhook';

export function onNormalFinishScorePost(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.finish.score.post', async (req: any): Promise<void> => {
    const request: NormalFinishScorePostRequest = safeParseJSON(req);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.finish.score.posted', JSON.stringify({
      userId: getSocketDataUser(socket).i,
      score: request.score
    }));
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
