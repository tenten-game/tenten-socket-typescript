import { Socket, Server as SocketServer } from "socket.io";
import { RealTimeScoreGetRequest, RealTimeScoreGetResponse, RealTimeScorePostRequest } from "../../application/event/dto/event.ingame.dto";
import { handleEventInGameRealTimeScoreGet, handleEventInGameRealTimeScorePost } from "../../application/event/event.ingame.service";
import { getSocketDataRoomNumber, getSocketDataUser } from "../../repository/socket/socket.repository";
import { getRoom } from "../../repository/common/room.repository";
import { Room } from "../../common/entity/room.entity";

export function onEventInGameRealTimeScorePost(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.ingame.realTimeScore.post', async (req: any): Promise<void> => {
    req.teamId = getSocketDataUser(socket).t;
    _socketServer.to(socket.data.hostSocketId).emit('event.ingame.realTimeScore.got', JSON.stringify(req));
  });
}

export function onEventInGameRealTimeScoreGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.ingame.realTimeScore.get', async (req: any): Promise<void> => {
    // const request: RealTimeScoreGetRequest = typeof req === 'string' ? JSON.parse(req) : req;
    // const response: RealTimeScoreGetResponse = await handleEventInGameRealTimeScoreGet(request, getSocketDataRoomNumber(socket));
    // socket.emit('event.ingame.realTimeScore.got', JSON.stringify(response)); // 나한테만 쏘기
  });
}
