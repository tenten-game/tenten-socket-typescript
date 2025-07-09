import { Socket, Server as SocketServer } from 'socket.io';
import { safeParseJSON } from '../../application/common/validation.service';
import { NormalFinishScorePostRequest } from '../../application/normal/dto/request';
import { NormalFinishScorePostResponse } from '../../application/normal/dto/response';
import { getSocketDataRoomNumber, getSocketDataUserId } from '../../repository/socket/socket.repository';
import { registerSocketEvent } from '../../util/error.handler';

export function onNormalFinishScorePost(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.finish.score.post', async (req: any): Promise<void> => {
    const request: NormalFinishScorePostRequest = safeParseJSON(req);
    const response: NormalFinishScorePostResponse = new NormalFinishScorePostResponse(getSocketDataUserId(socket), request.matchCode, request.score)
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.finish.score.posted', JSON.stringify(response));
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
