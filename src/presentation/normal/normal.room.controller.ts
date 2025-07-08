import { randomUUID } from 'node:crypto';
import { Socket, Server as SocketServer } from 'socket.io';
import { NormalRoomCreateRequest, NormalRoomGameStartRequest, NormalRoomModeChangeRequest, NormalRoomUserIconChangeRequest, NormalRoomUserTeamChangeRequest } from '../../application/normal/dto/request';
import { NormalRoomUserCountGetResponse, NormalRoomUserListGetResponse, NormalRoomUserTeamShuffleResponse } from '../../application/normal/dto/response';
import { handleNormalRoomChangeMode, handleNormalRoomCreate, handleNormalRoomEnter, handleNormalRoomUserCountGet, handleNormalRoomUserIconChange, handleNormalRoomUserListGet, handleNormalRoomUserTeamChange, handleNormalRoomUserTeamShuffle } from '../../application/normal/normal.room.service';
import { User } from '../../common/entity/user.entity';
import { SocketDataType } from '../../common/enums/enums';
import { getSocketDataRoomNumber, getSocketDataUser, setSocketDataUserAndRoomNumber } from '../../repository/socket/socket.repository';
import { registerSocketEvent } from '../../util/error.handler';
import { safeParseJSON, validateIconId, validateRoomNumber, validateTeamId, validateUser } from '../../util/validation';
import { handleNormalUserDisconnected, NormalDisconnectResponse } from '../../application/common/connection.service';

export function onNormalRoomCreate(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.create', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = safeParseJSON(req);
    validateRoomNumber(request.roomNumber);
    validateUser(request.user);
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, '', SocketDataType.NORMAL_USER);
    await handleNormalRoomCreate(request);
    socket.emit('normal.room.created');
  });
}

export function onNormalRoomEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.enter', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = safeParseJSON(req);
    validateRoomNumber(request.roomNumber);
    validateUser(request.user);
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, socket.id, SocketDataType.NORMAL_USER);
    await handleNormalRoomEnter(request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.entered', {
      user: getSocketDataUser(socket),
      roomNumber: request.roomNumber,
    });
  });
}

export function onNormalRoomReenter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.reenter', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = safeParseJSON(req);
    validateRoomNumber(request.roomNumber);
    validateUser(request.user);
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, socket.id, SocketDataType.NORMAL_USER);
    await handleNormalRoomEnter(request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.reentered', JSON.stringify(getSocketDataUser(socket)));
  });
}

export function onNormalRoomLeave(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.leave', async (req: any): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);
    const user = getSocketDataUser(socket);
    const disconnectResponse: NormalDisconnectResponse = await handleNormalUserDisconnected(roomNumber, user);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.left', JSON.stringify({
      user: getSocketDataUser(socket),
      isMaster: disconnectResponse.isMaster,
      isStarter: disconnectResponse.isStarter,
      newMaster: disconnectResponse.newMaster,
      newStarter: disconnectResponse.newStarter,
    }));
  });
}

export function onNormalRoomModeChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.mode.change', async (req: any): Promise<void> => {
    const request: NormalRoomModeChangeRequest = typeof req === 'string' ? JSON.parse(req) : req;
    await handleNormalRoomChangeMode(getSocketDataRoomNumber(socket), request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.mode.changed', JSON.stringify(request));
  });
}

export function onNormalRoomUserIconChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.user.icon.change', async (req: any): Promise<void> => {
    const request: NormalRoomUserIconChangeRequest = safeParseJSON(req);
    validateIconId(request.iconId);
    await handleNormalRoomUserIconChange(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request.iconId);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.icon.changed', JSON.stringify({
      userId: getSocketDataUser(socket).i,
      iconId: request.iconId
    }));
  });
}

export function onNormalRoomUserTeamChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.user.team.change', async (req: any): Promise<void> => {
    const request: NormalRoomUserTeamChangeRequest = safeParseJSON(req);
    validateTeamId(request.teamId);
    await handleNormalRoomUserTeamChange(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request.teamId);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.team.changed', JSON.stringify({
      userId: getSocketDataUser(socket).i,
      teamId: request.teamId
    }));
  });
}

export function onNormalRoomUserTeamShuffle(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.user.team.shuffle', async (): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const user: User = getSocketDataUser(socket);
    const response: NormalRoomUserTeamShuffleResponse = await handleNormalRoomUserTeamShuffle(roomNumber, user);
    _socketServer.to(roomNumber).emit('normal.room.user.team.shuffled', JSON.stringify(response));
  });
}

export function onNormalRoomGameStart(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.game.start', async (req: any): Promise<void> => {
    const request: NormalRoomGameStartRequest = safeParseJSON(req);
    const matchCode: string = new Date().getTime().toString() + randomUUID().slice(0, 10);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.game.started', JSON.stringify({
      matchCode: matchCode,
      gameNumber: request.gameNumber,
      playSeconds: request.playSeconds,
    }));
  });
}

export function onNormalRoomUserListGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.user.list.get', async (): Promise<void> => {
    const response: NormalRoomUserListGetResponse = await handleNormalRoomUserListGet(getSocketDataRoomNumber(socket));
    socket.emit('normal.room.user.list.got', JSON.stringify(response));
  });
}

export function onNormalRoomUserCountGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.user.count.get', async (): Promise<void> => {
    const userCount: NormalRoomUserCountGetResponse = await handleNormalRoomUserCountGet(getSocketDataRoomNumber(socket));
    socket.emit('normal.room.user.count.got', JSON.stringify(userCount));
  });
}
