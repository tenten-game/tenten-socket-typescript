import { Socket, Server as SocketServer } from "socket.io";
import { EventLobbyStartGameRequest } from "../../application/event/dto/request";
import { registerSocketEvent } from '../../util/error.handler';
import { handleEventLobbyUserListReset, handleLobbyUserCountGet, handleLobbyUserListGet } from "../../application/event/event.lobby.service";
import { getSocketDataRoomNumber } from "../../repository/socket/socket.repository";
import { UserCount } from "../../repository/common/dto/userCount.dto";
import { loggingTimeStamp } from "../../config/redis.config";
import { User } from "../../common/entity/user.entity";

export function onLobbyStartGame(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'event.lobby.startGame', async (req: any): Promise<void> => {
    const request: EventLobbyStartGameRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber = getSocketDataRoomNumber(socket);
    const now = Date.now();
    const response = {...request, startTime: now, gap: 14000, revisionTime: 800};
    loggingTimeStamp(`${roomNumber}_${request.match}_LOG_START_GAME`);
    _socketServer.to(roomNumber).emit('event.lobby.startedGame', JSON.stringify(response)); // 방에 있는 모든 사람에게 쏘기
  });
}

export function onLobbyUserCountGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'event.lobby.userCount.get', async (): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const userCount: UserCount = await handleLobbyUserCountGet(roomNumber);
    socket.emit('event.lobby.userCount.got', JSON.stringify(userCount));
  });
}

export function onLobbyUserListGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'event.lobby.userList.get', async (): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);
    const users: Record<number, User> = await handleLobbyUserListGet(roomNumber);
    socket.emit('event.lobby.userList.got', JSON.stringify(users));
  });
}

export function onLobbyResetUserList(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'event.lobby.userList.reset', async (req: any): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    handleEventLobbyUserListReset(roomNumber);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('event.lobby.userList.reseted');
  });
}
