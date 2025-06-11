import { Socket, Server as SocketServer } from 'socket.io';
import { NormalRoomCreateRequest, NormalRoomGameStartRequest, NormalRoomModeChangeRequest, NormalRoomUserIconChangeRequest, NormalRoomUserTeamChangeRequest } from '../../application/normal/dto/request';
import { NormalRoomUserCountGetResponse, NormalRoomUserListGetResponse } from '../../application/normal/dto/response';
import { SocketDataType } from '../../common/enums/enums';
import { getSocketDataRoomNumber, getSocketDataUser, getSocketDataUserId, setSocketDataUserAndRoomNumber } from '../../repository/socket/socket.repository';
import { handleNormalRoomChangeMode, handleNormalRoomCreate, handleNormalRoomEnter, handleNormalRoomUserCountGet, handleNormalRoomUserIconChange, handleNormalRoomUserListGet, handleNormalRoomUserTeamChange, handleNormalRoomUserTeamShuffle } from '../../application/normal/normal.room.service';

export function onNormalRoomCreate(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.create', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, '', SocketDataType.NORMAL_USER);
    handleNormalRoomCreate(request);
    socket.emit('normal.room.created');
  });
}

export function onNormalRoomEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.enter', async (req: any): Promise<void> => {
    const request: NormalRoomCreateRequest = typeof req === 'string' ? JSON.parse(req) : req;
    socket.join(request.roomNumber);
    setSocketDataUserAndRoomNumber(socket, req.user, request.roomNumber, socket.id, SocketDataType.NORMAL_USER);
    handleNormalRoomEnter(request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.entered', JSON.stringify(getSocketDataUser(socket)));
  });
}

export function onNormalRoomModeChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.mode.change', async (req: any): Promise<void> => {
    const request: NormalRoomModeChangeRequest = typeof req === 'string' ? JSON.parse(req) : req;
    await handleNormalRoomChangeMode(getSocketDataRoomNumber(socket), request);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.mode.changed', JSON.stringify(request));
  });
}

export function onNormalRoomUserIconChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.icon.change', async (req: any): Promise<void> => {
    const request: NormalRoomUserIconChangeRequest = typeof req === 'string' ? JSON.parse(req) : req;
    handleNormalRoomUserIconChange(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request.iconId);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.icon.changed', JSON.stringify({
      userId: getSocketDataUserId(socket),
      iconId: request.iconId
    }));
  });
}

export function onNormalRoomUserTeamChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.team.change', async (req: any): Promise<void> => {
    const request: NormalRoomUserTeamChangeRequest = typeof req === 'string' ? JSON.parse(req) : req;
    await handleNormalRoomUserTeamChange(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request.teamId);
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.team.changed', JSON.stringify({
      userId: getSocketDataUserId(socket),
      teamId: request.teamId
    }));
  });
}

export function onNormalRoomUserTeamShuffle(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.team.shuffle', async (): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);
    const user = getSocketDataUser(socket);
    await handleNormalRoomUserTeamShuffle(roomNumber, user);
    _socketServer.to(roomNumber).emit('normal.room.user.team.shuffled');
  });
}

export function onNormalRoomGameStart(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.game.start', async (req: any): Promise<void> => {
    const request: NormalRoomGameStartRequest = typeof req === 'string' ? JSON.parse(req) : req;
    _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.game.started', JSON.stringify(request));
  });
}

export function onNormalRoomUserListGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.list.get', async (): Promise<void> => {
    const userList: NormalRoomUserListGetResponse = await handleNormalRoomUserListGet(getSocketDataRoomNumber(socket));
    socket.emit('normal.room.user.list.got', JSON.stringify(userList));
  });
}

export function onNormalRoomUserCountGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.count.get', async (): Promise<void> => {
    const userCount: NormalRoomUserCountGetResponse = await handleNormalRoomUserCountGet(getSocketDataRoomNumber(socket));
    socket.emit('normal.room.user.count.got', JSON.stringify(userCount));
  });
}
