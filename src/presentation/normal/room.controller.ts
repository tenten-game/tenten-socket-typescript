import { Socket, Server as SocketServer } from 'socket.io';
import { getSocketDataRoomNumber, getSocketDataUser, getSocketDataUserId, setSocketDataRoomNumber } from '../../repository/socket/socket.repository';
import { RoomChangeModeRequest, RoomNumberRequest } from '../../common/dto/room.dto';
import { handleRoomChangeMode, handleRoomCreate, handleRoomEnter } from '../../application/normal/room.service';

export function onRoomCreate(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('room.create', async (req: any): Promise<void> => {
    const room: RoomNumberRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(room.number);
    setSocketDataRoomNumber(socket, room.number);
    handleRoomCreate(room, getSocketDataUser(socket));
  });
}

export function onRoomEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('room.enter', async (req: any): Promise<void> => {
    const room: RoomNumberRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(room.number);
    setSocketDataRoomNumber(socket, room.number);
    handleRoomEnter(room, getSocketDataUser(socket));
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('room.entered', JSON.stringify(getSocketDataUser(socket)));
  });
}

export function onRoomChangeMode(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('room.changeMode', async (req: any): Promise<void> => {
    const roomChangeModeRequest: RoomChangeModeRequest = typeof req === 'string' ? JSON.parse(req) : req;
    await handleRoomChangeMode(roomChangeModeRequest, getSocketDataRoomNumber(socket), getSocketDataUserId(socket));
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('room.changedMode', JSON.stringify(roomChangeModeRequest));
  });
}

export function onRoomExit(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('room.enter', async (req: any): Promise<void> => {
    const room: RoomNumberRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.data.room = room.number;
  });
}
