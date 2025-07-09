import { Socket, Server as SocketServer } from "socket.io";
import { RealTimeScoreGetRequest, RealTimeScorePostRequest } from "../../application/event/dto/request";
import { registerSocketEvent } from '../../util/error.handler';
import { RealTimeScoreGetResponse } from "../../application/event/dto/response";
import { handleEventInGameRealTimeScoreGet, handleEventInGameRealTimeScorePost } from "../../application/event/event.ingame.service";
import { getSocketDataRoomNumber, getSocketDataTeamIdOnlyUseInEvent } from "../../repository/socket/socket.repository";

export function onEventInGameRealTimeScorePost(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'event.ingame.realTimeScore.post', async (req: any): Promise<void> => {
    const request: RealTimeScorePostRequest = typeof req === 'string' ? JSON.parse(req) : req;
    await handleEventInGameRealTimeScorePost(request, getSocketDataRoomNumber(socket), getSocketDataTeamIdOnlyUseInEvent(socket));
  });
}

export function onEventInGameRealTimeScoreGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'event.ingame.realTimeScore.get', async (req: any): Promise<void> => {
    const request: RealTimeScoreGetRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const response: RealTimeScoreGetResponse = await handleEventInGameRealTimeScoreGet(request, getSocketDataRoomNumber(socket));
    socket.emit('event.ingame.realTimeScore.got', JSON.stringify(response)); // 나한테만 쏘기
  });
}

export function onEventInGameSendSeed(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'event.ingame.sendSeed', async (req: any): Promise<void> => { // BYPASS
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('event.ingame.sentSeed', JSON.stringify(req));
  });
}
