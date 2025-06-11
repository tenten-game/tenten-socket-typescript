import { Socket, Server as SocketServer } from 'socket.io';
import { getSocketDataRoomNumber, getSocketDataUser, getSocketDataUserId } from '../../repository/socket/socket.repository';
import { handleNormalInGame6030Do, handleNormalInGame6040Do } from '../../application/normal/normal.ingame.service';
import { NormalInGame6040DoRequest } from '../../application/normal/dto/request';

export function onNormalInGameBypass(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.ingame.bypass', async (req: any): Promise<void> => {
    const request = typeof req === 'string' ? JSON.parse(req) : req;
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.ingame.bypassed', JSON.stringify(request));
  });
}

export function onNormalInGame6030Do(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.ingame.6030.do', async (): Promise<void> => {
    const response: number = await handleNormalInGame6030Do(getSocketDataRoomNumber(socket), getSocketDataUserId(socket));
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.ingame.6030.did', JSON.stringify(response));
  });
}

export function onNormalInGame6040Do(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.ingame.6040.do', async (req: any): Promise<void> => {
    const request: NormalInGame6040DoRequest = typeof req === 'string' ? JSON.parse(req) : req;
    await handleNormalInGame6040Do(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.ingame.6040.did', JSON.stringify({
      user: getSocketDataUser(socket),
      floorData: request.floorData
    }));
  });
}
