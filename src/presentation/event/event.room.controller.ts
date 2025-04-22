import { Socket, Server as SocketServer } from 'socket.io';
import { EventRoomChangeModeRequest, EventRoomCreateRequest, EventRoomEnterRequest } from '../../application/event/dto/event.room.dto';
import { handleEventRoomChangeMode, handleEventRoomCreate, handleEventRoomEnterAndGetHostSocketId, handleEventRoomHostReEnter } from '../../application/event/event.room.service';
import { getEventHostSocketDataRoomNumber, setEventHostSocketData, setSocketDataUserAndRoomNumber } from '../../repository/socket/socket.repository';
import { SocketDataType } from '../../common/enums/enums';
import { RoomNumberRequest } from '../../common/dto/room.dto';

export function onEventRoomCreate(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.room.create', async (req: any): Promise<void> => {
    const request: EventRoomCreateRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(request.roomNumber);
    setEventHostSocketData(socket, request.roomNumber);
    handleEventRoomCreate(request, socket.id);
    socket.emit('event.room.created');
  });
}

export function onEventRoomChangeMode(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.room.changeMode', async (req: any): Promise<void> => {
    const request: EventRoomChangeModeRequest = typeof req === 'string' ? JSON.parse(req) : req;
    const roomNumber: string = getEventHostSocketDataRoomNumber(socket);
    handleEventRoomChangeMode(request, roomNumber);
    _socketServer.to(roomNumber).emit('event.room.changedMode', JSON.stringify(request));
  });
}

export function onEventRoomHostReEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.room.host.reEnter', async (req: any): Promise<void> => {
    const request: RoomNumberRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(request.roomNumber);
    setEventHostSocketData(socket, request.roomNumber);
    await handleEventRoomHostReEnter(request.roomNumber, socket.id);
    socket.emit('event.room.host.reEntered');
  });
}

export function onEventRoomEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.room.enter', async (req: any): Promise<void> => {
    const request: EventRoomEnterRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(request.roomNumber);
    const hostSocketId: string = await handleEventRoomEnterAndGetHostSocketId(request);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, hostSocketId, SocketDataType.EVENT_USER);
    _socketServer.to(hostSocketId).emit('event.room.entered', JSON.stringify(request.user));
    socket.emit('event.room.entered');
  });
}
