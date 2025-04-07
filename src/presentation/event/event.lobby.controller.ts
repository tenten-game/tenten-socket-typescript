import { Socket, Server as SocketServer } from "socket.io";
import { EventLobbyStartGameRequest } from "../../application/event/dto/event.lobby.dto";
import { handleLobbyUserCountGet } from "../../application/event/event.lobby.service";
import { getSocketDataRoomNumber } from "../../repository/socket/socket.repository";

export function onLobbyStartGame(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.startGame', async (req: any): Promise<void> => {
    const request: EventLobbyStartGameRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber = getSocketDataRoomNumber(socket);
    _socketServer.to(roomNumber).emit('event.lobby.startedGame', JSON.stringify(request)); // 방에 있는 모든 사람에게 쏘기
  });
}

export function onLobbyUserCountGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.userCount.get', async (req: any): Promise<void> => {
    console.log('event.lobby.userCount.get');
    const roomNumber = getSocketDataRoomNumber(socket);
    handleLobbyUserCountGet(roomNumber);
    socket.emit('event.lobby.userCount.got', JSON.stringify({ socketUserCount: 0 })); // 나한테만 쏘기
  });
}

export function onLobbyUserListGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.userList.get', async (req: any): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);
    const userCount = _socketServer.sockets.adapter.rooms.get(roomNumber)?.size || 0;
    _socketServer.to(roomNumber).emit('event.lobby.userList.got', JSON.stringify({ userCount })); // 방에 있는 모든 사람에게 쏘기
  });
}

export function onLobbyResetUserList(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.lobby.userList.reset', async (req: any): Promise<void> => {

  });
}