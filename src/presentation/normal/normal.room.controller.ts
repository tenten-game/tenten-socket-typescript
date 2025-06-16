import { Socket, Server as SocketServer } from 'socket.io';
import { NormalRoomCreateRequest, NormalRoomGameStartRequest, NormalRoomModeChangeRequest, NormalRoomUserIconChangeRequest, NormalRoomUserTeamChangeRequest } from '../../application/normal/dto/request';
import { NormalRoomUserCountGetResponse, NormalRoomUserListGetResponse } from '../../application/normal/dto/response';
import { handleNormalRoomChangeMode, handleNormalRoomCreate, handleNormalRoomEnter, handleNormalRoomUserCountGet, handleNormalRoomUserIconChange, handleNormalRoomUserListGet, handleNormalRoomUserTeamChange, handleNormalRoomUserTeamShuffle } from '../../application/normal/normal.room.service';
import { User } from '../../common/entity/user.entity';
import { SocketDataType } from '../../common/enums/enums';
import { getSocketDataRoomNumber, getSocketDataUser, setSocketDataUserAndRoomNumber } from '../../repository/socket/socket.repository';
import { safeParseJSON, validateIconId, validateRoomNumber, validateTeamId, validateUser } from '../../util/validation';
import { sendGoogleChatMessage } from '../../util/webhook';

export function onNormalRoomCreate(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.create', async (req: any): Promise<void> => {
    try {
      const request: NormalRoomCreateRequest = safeParseJSON(req);
      validateRoomNumber(request.roomNumber);
      validateUser(request.user);
      socket.join(request.roomNumber);
      setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, '', SocketDataType.NORMAL_USER);
      await handleNormalRoomCreate(request);
      socket.emit('normal.room.created');
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to create room: ${error}`);
    }
  });
}

export function onNormalRoomEnter(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.enter', async (req: any): Promise<void> => {
    try {
      const request: NormalRoomCreateRequest = safeParseJSON(req);
      validateRoomNumber(request.roomNumber);
      validateUser(request.user);
      socket.join(request.roomNumber);
      setSocketDataUserAndRoomNumber(socket, request.user, request.roomNumber, socket.id, SocketDataType.NORMAL_USER);
      await handleNormalRoomEnter(request);
      _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.entered', JSON.stringify(getSocketDataUser(socket)));
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to enter room: ${error}`);
    }
  });
}

export function onNormalRoomModeChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.mode.change', async (req: any): Promise<void> => {
    try {
      const request: NormalRoomModeChangeRequest = typeof req === 'string' ? JSON.parse(req) : req;
      await handleNormalRoomChangeMode(getSocketDataRoomNumber(socket), request);
      _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.mode.changed', JSON.stringify(request));  
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to change mode: ${error}`);
    }
  });
}

export function onNormalRoomUserIconChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.icon.change', async (req: any): Promise<void> => {
    try {
      const request: NormalRoomUserIconChangeRequest = safeParseJSON(req);
      validateIconId(request.iconId);
      await handleNormalRoomUserIconChange(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request.iconId);
      _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.icon.changed', JSON.stringify({
        userId: getSocketDataUser(socket).i,
        iconId: request.iconId
      }));
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to change icon: ${error}`);
    }
  });
}

export function onNormalRoomUserTeamChange(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.team.change', async (req: any): Promise<void> => {
    try {
      const request: NormalRoomUserTeamChangeRequest = safeParseJSON(req);
     validateTeamId(request.teamId);
      await handleNormalRoomUserTeamChange(getSocketDataRoomNumber(socket), getSocketDataUser(socket), request.teamId);
      _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.user.team.changed', JSON.stringify({
        userId: getSocketDataUser(socket).i,
        teamId: request.teamId
      }));
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to change team: ${error}`);
    }
  });
}

export function onNormalRoomUserTeamShuffle(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.team.shuffle', async (): Promise<void> => {
    try {
      const roomNumber: string = getSocketDataRoomNumber(socket);
      const user: User = getSocketDataUser(socket);
      const response: Record<number, User> = await handleNormalRoomUserTeamShuffle(roomNumber, user);
      _socketServer.to(roomNumber).emit('normal.room.user.team.shuffled', JSON.stringify(response));
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to shuffle teams: ${error}`);
    }
  });
}

export function onNormalRoomGameStart(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.game.start', async (req: any): Promise<void> => {
    try {
      const request: NormalRoomGameStartRequest = safeParseJSON(req);
      _socketServer.to(getSocketDataRoomNumber(socket)).emit('normal.room.game.started', JSON.stringify(request));  
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to start game: ${error}`);
    }
  });
}

export function onNormalRoomUserListGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.list.get', async (): Promise<void> => {
    try {
      const userList: NormalRoomUserListGetResponse = await handleNormalRoomUserListGet(getSocketDataRoomNumber(socket));
      socket.emit('normal.room.user.list.got', JSON.stringify(userList));
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to get user list: ${error}`);
    }
  });
}

export function onNormalRoomUserCountGet(
  _socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('normal.room.user.count.get', async (): Promise<void> => {
    try {
      const userCount: NormalRoomUserCountGetResponse = await handleNormalRoomUserCountGet(getSocketDataRoomNumber(socket));
      socket.emit('normal.room.user.count.got', JSON.stringify(userCount));
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} failed to get user count: ${error}`);
    }
  });
}
