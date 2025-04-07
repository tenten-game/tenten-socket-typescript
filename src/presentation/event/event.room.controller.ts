import { Socket, Server as SocketServer } from 'socket.io';
import { EventRoomChangeModeRequest, EventRoomCreateRequest, EventRoomEnterRequest } from '../../application/event/dto/event.room.dto';
import { handleEventRoomChangeMode, handleEventRoomCreate, handleEventRoomEnterAndGetHostSocketId } from '../../application/event/event.room.service';
import { getEventHostSocketDataRoomNumber, setSocketDataRoomNumber, setSocketDataUser } from '../../repository/socket/socket.repository';

export function onEventRoomCreate(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.room.create', async (req: any): Promise<void> => {
    const request: EventRoomCreateRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(request.roomNumber);
    setSocketDataRoomNumber(socket, request.roomNumber);
    handleEventRoomCreate(request, socket.id);
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

export function onEventRoomEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('event.room.enter', async (req: any): Promise<void> => {
    const request: EventRoomEnterRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(request.roomNumber);
    setSocketDataUser(socket, request.user);
    setSocketDataRoomNumber(socket, request.roomNumber);
    const hostSocketId: string = await handleEventRoomEnterAndGetHostSocketId(request);
    _socketServer.to(hostSocketId).emit('event.room.entered', JSON.stringify(request.user));
  });
}
