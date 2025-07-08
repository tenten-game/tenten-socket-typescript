import { Socket, Server as SocketServer } from 'socket.io';
import { NormalInGame6040DoRequest } from '../../application/normal/dto/request';
import { handleNormalInGame6030Do, handleNormalInGame6030DoAfter, handleNormalInGame6040Do, handleNormalInGame6040Finish, handleNormalInGame6040FinishAfter } from '../../application/normal/normal.ingame.service';
import { User } from '../../common/entity/user.entity';
import { getSocketDataRoomNumber, getSocketDataUser } from '../../repository/socket/socket.repository';
import { registerSocketEvent } from '../../util/error.handler';
import { safeParseJSON, validateRequest } from '../../util/validation';

export function onNormalBypass(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.bypass', async (req: any): Promise<void> => {
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.bypassed', JSON.stringify(req));
  });
}

export function onNormalInGame6030Do(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.ingame.6030.do', async (): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const response: number = await handleNormalInGame6030Do(roomNumber, getSocketDataUser(socket).i);
    await handleNormalInGame6030DoAfter(roomNumber);
    _socketServer.to(roomNumber).emit('normal.ingame.6030.did', JSON.stringify({
      userId: response
    }));
  });
}

export function onNormalInGame6040Do(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.ingame.6040.do', async (req: any): Promise<void> => {
    const request: NormalInGame6040DoRequest = safeParseJSON(req);
    validateRequest(request, ['floorData']);
    const roomNumber: string = getSocketDataRoomNumber(socket)
    await handleNormalInGame6040Do(roomNumber, getSocketDataUser(socket), request);
    _socketServer.to(roomNumber).emit('normal.ingame.6040.did', JSON.stringify({
      user: getSocketDataUser(socket),
      floorData: request.floorData
    }));
  });
}

export function onNormalInGame6040Finish(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.ingame.6040.finish', async (): Promise<void> => {
    const response: Record<number, User[]> = await handleNormalInGame6040Finish(getSocketDataRoomNumber(socket));
    await handleNormalInGame6040FinishAfter(getSocketDataRoomNumber(socket));
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.ingame.6040.finished', JSON.stringify(response));
  });
}
