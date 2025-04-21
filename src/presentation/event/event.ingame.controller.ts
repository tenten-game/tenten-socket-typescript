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
    // const request: RealTimeScorePostRequest = typeof req === 'string' ? JSON.parse(req) : req;
    // handleEventInGameRealTimeScorePost(request, getSocketDataRoomNumber(socket), getSocketDataUser(socket).t);
    const room: Room = await getRoom(getSocketDataRoomNumber(socket))
    _socketServer.to(room.hostSocketId).emit('event.ingame.realTimeScore.got', req);
  });
}

export function onEventInGameRealTimeScoreGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.ingame.realTimeScore.get', async (req: any): Promise<void> => {
    console.log('event.ingame.realTimeScore.get', req);
    // const request: RealTimeScoreGetRequest = typeof req === 'string' ? JSON.parse(req) : req;
    // const response: RealTimeScoreGetResponse = await handleEventInGameRealTimeScoreGet(request, getSocketDataRoomNumber(socket));
    // socket.emit('event.ingame.realTimeScore.got', JSON.stringify(response)); // 나한테만 쏘기
  });
}
