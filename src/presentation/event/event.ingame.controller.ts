import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { RealTimeScoreGetRequest, RealTimeScoreGetResponse, RealTimeScorePostRequest } from "../../application/event/dto/event.ingame.dto";
import { getSocketDataRoomNumber, getSocketDataUser } from "../../repository/socket/socket.repository";
import { handleEventInGameRealTimeScoreGet, handleEventInGameRealTimeScorePost } from "../../application/event/event.ingame.service";
import { User } from "../../common/entity/user.entity";

export function onEventInGameRealTimeScorePost(
    _socketServer: SocketServer,
    socket: Socket
): void {
  socket.on('event.ingame.realTimeScore.post', async (req: any): Promise<void> => {
    const request: RealTimeScorePostRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const user: User = getSocketDataUser(socket);
    handleEventInGameRealTimeScorePost(request, roomNumber, user.t);
  });
}

export function onEventInGameRealTimeScoreGet(
    _socketServer: SocketServer,
    socket: Socket
): void {
  socket.on('event.ingame.realTimeScore.get', async (req: any): Promise<void> => {
    const request: RealTimeScoreGetRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const response: RealTimeScoreGetResponse = await handleEventInGameRealTimeScoreGet(request, roomNumber);
    socket.emit('event.ingame.realTimeScore.got', JSON.stringify(response)); // 나한테만 쏘기
  });
}
