import { Socket, Server as SocketServer } from "socket.io";
import { EventLobbyStartGameRequest, EventLobbyStartGameResponse } from "../../application/event/dto/event.lobby.dto";
import { handleEventLobbyUserListReset, handleLobbyUserCountGet, handleLobbyUserListGet, handleShuffleTeam } from "../../application/event/event.lobby.service";
import { getSocketDataRoomNumber } from "../../repository/socket/socket.repository";
import { UserCount } from "../../repository/common/dto/userCount.dto";
import { loggingTimeStamp } from "../../config/redis.config";

export function onLobbyStartGame(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.startGame', async (req: any): Promise<void> => {
    const request: EventLobbyStartGameRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber = getSocketDataRoomNumber(socket);
    const now = Date.now();
    const response = {...request, startTime: now, gap: 11000};
    loggingTimeStamp(`${roomNumber}_LOG_START_GAME`);
    _socketServer.to(roomNumber).emit('event.lobby.startedGame', JSON.stringify(response)); // 방에 있는 모든 사람에게 쏘기
  });
}

export function onLobbyUserCountGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.userCount.get', async (): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const userCount: UserCount = await handleLobbyUserCountGet(roomNumber);
    socket.emit('event.lobby.userCount.got', JSON.stringify(userCount));
  });
}

export function onLobbyUserListGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.userList.get', async (): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);
    const users = await handleLobbyUserListGet(roomNumber);
    socket.emit('event.lobby.userList.got', JSON.stringify(users));
  });
}

export function onLobbyResetUserList(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.userList.reset', async (req: any): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    handleEventLobbyUserListReset(roomNumber);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('event.lobby.userList.reseted');
  });
}

export function onLobbyShuffleTeam(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.shuffleTeam', async (req: any): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const userIds: number[] = await handleShuffleTeam(roomNumber);
    _socketServer.to(roomNumber).emit('event.lobby.shuffledTeam', JSON.stringify(userIds));
  });
}