import { instrument } from '@socket.io/admin-ui';
import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from 'socket.io';
import { onConnectError, onDisconnect, onDisconnecting, onTest } from '../presentation/common/connection.controller';
import { onEventFinishExit, onEventFinishRankingGet, onEventFinishScoreGet, onEventFinishScorePost } from '../presentation/event/event.finish.controller';
import { onEventInGameRealTimeScoreGet, onEventInGameRealTimeScorePost, onEventInGameSendSeed } from '../presentation/event/event.ingame.controller';
import { onLobbyResetUserList, onLobbyStartGame, onLobbyUserCountGet, onLobbyUserListGet } from '../presentation/event/event.lobby.controller';
import { onEventRoomChangeMode, onEventRoomCreate, onEventRoomEnter, onEventRoomHostReEnter } from '../presentation/event/event.room.controller';
import { onNormalFinishExit, onNormalFinishScorePost } from '../presentation/normal/normal.finish.controller';
import { onNormalInGame6030Do, onNormalInGame6040Do, onNormalInGameBypass } from '../presentation/normal/normal.ingame.controller';
import { onNormalRoomCreate, onNormalRoomEnter, onNormalRoomGameStart, onNormalRoomModeChange, onNormalRoomUserCountGet, onNormalRoomUserIconChange, onNormalRoomUserListGet, onNormalRoomUserTeamChange, onNormalRoomUserTeamShuffle } from '../presentation/normal/normal.room.controller';
import { logger } from '../util/logger';
import { config } from './env.config';
import { redisAdapter } from "./redis.config";

export function installSocketIo(https: HttpServer): SocketServer {

  const socket = require('socket.io');
  const jwt = require('jsonwebtoken');

  const socketIO: SocketServer = socket(https, {
    pingInterval: 25000, // ping 메시지 전송 간격 (밀리초)
    pingTimeout: 20000, // ping 메시지 응답 대기 시간 (밀리초)
    cors: {
      origin: ['https://admin.socket.io'],
      credentials: true,
    },
  });

  instrument(socketIO, {
    auth: {
      type: 'basic',
      username: 'tenten-admin',
      password: '$2b$12$PD2rUQfBtio5rV.DY1z7Ou1WwtS3FdjamtHeh0UjBXokmuEllZsda', // Xpsxps12!@
    },
  });

  socketIO.adapter(redisAdapter);

  // socketIO.use((socket: Socket, next: any) => {
  //   const token = socket.handshake.headers.token;
  //   if (token) {
  //     jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
  //       // if (err) return next(new Error('AUTHENTICATION ERROR'));
  //       next();
  //     });  
  //   } else {
  //     // return next(new Error('AUTHENTICATION ERROR'));
  //   }
  // });

  return socketIO;
}

export function initializeSocket(socketServer: SocketServer): void {
  socketServer.on('connection', async (socket: Socket): Promise<void> => {

    // // token 꺼내다 쓰기
    // const token = socket.handshake.headers.token;

    handleDevelopmentEnvironment(socketServer, socket);

    // COMMON - CONNECTION
    onDisconnecting(socketServer, socket);
    onDisconnect(socketServer, socket);
    onConnectError(socketServer, socket);

    // NORMAL - ROOM
    onNormalRoomCreate(socketServer, socket);
    onNormalRoomEnter(socketServer, socket);
    onNormalRoomModeChange(socketServer, socket);
    onNormalRoomUserTeamChange(socketServer, socket);
    onNormalRoomUserIconChange(socketServer, socket);
    onNormalRoomUserTeamShuffle(socketServer, socket);
    onNormalRoomGameStart(socketServer, socket);
    onNormalRoomUserListGet(socketServer, socket);
    onNormalRoomUserCountGet(socketServer, socket);

    // NORMAL - IN-GAME
    onNormalInGameBypass(socketServer, socket);
    onNormalInGame6030Do(socketServer, socket);
    onNormalInGame6040Do(socketServer, socket);

    // NORMAL - FINISH
    onNormalFinishScorePost(socketServer, socket);
    onNormalFinishExit(socketServer, socket);

    // EVENT - ROOM
    onEventRoomCreate(socketServer, socket);
    onEventRoomChangeMode(socketServer, socket);
    onEventRoomHostReEnter(socketServer, socket);
    onEventRoomEnter(socketServer, socket);

    // EVENT - LOBBY
    onLobbyStartGame(socketServer, socket);
    onLobbyUserCountGet(socketServer, socket);
    onLobbyUserListGet(socketServer, socket);
    onLobbyResetUserList(socketServer, socket);

    // EVENT - IN_GAME
    onEventInGameRealTimeScorePost(socketServer, socket);
    onEventInGameRealTimeScoreGet(socketServer, socket);
    onEventInGameSendSeed(socketServer, socket);

    // EVENT - FINISH
    onEventFinishScoreGet(socketServer, socket);
    onEventFinishExit(socketServer, socket);
    onEventFinishScorePost(socketServer, socket);
    onEventFinishRankingGet(socketServer, socket);
  });

}

function handleDevelopmentEnvironment(
  socketServer: SocketServer,
  socket: Socket
): void {
  if (config.env === 'development') {
    socket.onAny((event, ...args) => logger.debug(`[ON] Socket Event: ${event}, Args: ${JSON.stringify(args)}, Socket ID: ${socket.id}, IP: ${socket.handshake.address}, UA: ${socket.handshake.headers['user-agent']}`));
    socket.onAnyOutgoing((event, ...args) => logger.debug(`[EMIT] Socket Event: ${event}, Args: ${JSON.stringify(args)}, Socket ID: ${socket.id}, IP: ${socket.handshake.address}, UA: ${socket.handshake.headers['user-agent']}`));
    const originalEmit = socketServer.emit;
    socketServer.emit = function (event: string, ...args: unknown[]) {
      logger.debug(`[EMIT] Socket Event: ${event}, Args: ${JSON.stringify(args)}`);
      return originalEmit.apply(socketServer, [event, ...args]);
    }
  } else if (config.env === 'test') {
    onTest(socketServer, socket);
  }
}