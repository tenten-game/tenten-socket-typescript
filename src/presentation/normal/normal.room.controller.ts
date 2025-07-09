import { randomUUID } from 'node:crypto';
import { Socket, Server as SocketServer } from 'socket.io';
import { handleNormalUserDisconnected, NormalDisconnectResponse } from '../../application/common/connection.service';
import { safeParseJSON } from '../../application/common/validation.service';
import { NormalRoomCreateRequest, NormalRoomGameStartRequest, NormalRoomModeChangeRequest, NormalRoomUserIconChangeRequest, NormalRoomUserTeamChangeRequest } from '../../application/normal/dto/request';
import { NormalRoomEnterResponse, NormalRoomGameStartResponse, NormalRoomLeaveResponse, NormalRoomReenterResponse, NormalRoomUserCountGetResponse, NormalRoomUserIconChangeResponse, NormalRoomUserListGetResponse, NormalRoomUserTeamChangeResponse, NormalRoomUserTeamShuffleResponse } from '../../application/normal/dto/response';
import { handleNormalRoomChangeMode, handleNormalRoomCreate, handleNormalRoomEnter, handleNormalRoomUserCountGet, handleNormalRoomUserIconChange, handleNormalRoomUserListGet, handleNormalRoomUserTeamChange, handleNormalRoomUserTeamShuffle } from '../../application/normal/normal.room.service';
import { SocketDataType } from '../../common/enums/enums';
import { getSocketDataRoomNumber, getSocketDataUserId, setSocketDataUserAndRoomNumber } from '../../repository/socket/socket.repository';
import { registerSocketEvent } from '../../util/error.handler';

export function onNormalRoomCreate(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.create', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = safeParseJSON(req);
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, socket.id, SocketDataType.NORMAL_USER);
    await handleNormalRoomCreate(request, socket.id);
    socket.emit('normal.room.created');
  });
}

export function onNormalRoomEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.enter', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = safeParseJSON(req);
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, socket.id, SocketDataType.NORMAL_USER);
    const response: NormalRoomEnterResponse = await handleNormalRoomEnter(request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.entered', JSON.stringify(response));
  });
}

export function onNormalRoomReenter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.reenter', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = safeParseJSON(req);
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, socket.id, SocketDataType.NORMAL_USER);
    const response: NormalRoomReenterResponse = await handleNormalRoomEnter(request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.reentered', JSON.stringify(response));
  });
}

export function onNormalRoomLeave(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.leave', async (): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);
    const disconnectResponse: NormalDisconnectResponse = await handleNormalUserDisconnected(roomNumber, getSocketDataUserId(socket));
    const response = new NormalRoomLeaveResponse(disconnectResponse.user, disconnectResponse.isMaster, disconnectResponse.isStarter, disconnectResponse.newMaster, disconnectResponse.newStarter);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.left', JSON.stringify(response));
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
    const response: NormalRoomUserIconChangeResponse = await handleNormalRoomUserIconChange(getSocketDataRoomNumber(socket), getSocketDataUserId(socket), request.iconId);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.icon.changed', JSON.stringify(response));
  });
}

export function onNormalRoomUserTeamChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.user.team.change', async (req: any): Promise<void> => {
    const request: NormalRoomUserTeamChangeRequest = safeParseJSON(req);
    const response: NormalRoomUserTeamChangeResponse = await handleNormalRoomUserTeamChange(getSocketDataRoomNumber(socket), getSocketDataUserId(socket), request.teamId);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.team.changed', JSON.stringify(response));
  });
}

export function onNormalRoomUserTeamShuffle(
  _socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'normal.room.user.team.shuffle', async (): Promise<void> => {
    const roomNumber: string = getSocketDataRoomNumber(socket);
    const response: NormalRoomUserTeamShuffleResponse = await handleNormalRoomUserTeamShuffle(roomNumber, getSocketDataUserId(socket));
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
    const response: NormalRoomGameStartResponse = new NormalRoomGameStartResponse(matchCode, request.gameNumber, request.playSeconds);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.game.started', JSON.stringify(response));
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
    const response: NormalRoomUserCountGetResponse = await handleNormalRoomUserCountGet(getSocketDataRoomNumber(socket));
    socket.emit('normal.room.user.count.got', JSON.stringify(response));
  });
}
