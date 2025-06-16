import { instrument } from '@socket.io/admin-ui';
import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from 'socket.io';
import { onConnectError, onDisconnecting, onTest } from '../presentation/common/connection.controller';
import { onEventFinishExit, onEventFinishRankingGet, onEventFinishScoreGet, onEventFinishScorePost } from '../presentation/event/event.finish.controller';
import { onEventInGameRealTimeScoreGet, onEventInGameRealTimeScorePost, onEventInGameSendSeed } from '../presentation/event/event.ingame.controller';
import { onLobbyResetUserList, onLobbyStartGame, onLobbyUserCountGet, onLobbyUserListGet } from '../presentation/event/event.lobby.controller';
import { onEventRoomChangeMode, onEventRoomCreate, onEventRoomEnter, onEventRoomHostReEnter } from '../presentation/event/event.room.controller';
import { onNormalFinishExit, onNormalFinishScorePost } from '../presentation/normal/normal.finish.controller';
import { onNormalInGame6030Do, onNormalInGame6040Do, onNormalInGame6040Finish, onNormalInGameBypass } from '../presentation/normal/normal.ingame.controller';
import { onNormalRoomCreate, onNormalRoomEnter, onNormalRoomGameStart, onNormalRoomModeChange, onNormalRoomUserCountGet, onNormalRoomUserIconChange, onNormalRoomUserListGet, onNormalRoomUserTeamChange, onNormalRoomUserTeamShuffle } from '../presentation/normal/normal.room.controller';
import { logger } from '../util/logger';
import { wrapSocketHandler } from '../util/error.handler';
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
      username: config.socketAdminUsername,
      password: config.socketAdminPasswordHash,
    },
  });

  socketIO.adapter(redisAdapter);

  // JWT Authentication Middleware
  // socketIO.use((socket: Socket, next: any) => {
  //   const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
  //   if (!token) {
  //     return next(new Error('Authentication token required'));
  //   }

  //   jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
  //     if (err) {
  //       return next(new Error('Invalid authentication token'));
  //     }
  //     socket.data.token = decoded;
  //     next();
  //   });
  // });

  return socketIO;
}

export function initializeSocket(socketServer: SocketServer): void {
  socketServer.on('connection', async (socket: Socket): Promise<void> => {

    // // token 꺼내다 쓰기
    // const token = socket.handshake.headers.token;
    // DEVELOPMENT, TEST
    handleDevelopmentEnvironment(socketServer, socket);

    // COMMON - CONNECTION
    wrapSocketHandler(onDisconnecting)(socketServer, socket);
    wrapSocketHandler(onConnectError)(socketServer, socket);

    /* ! NORMAL ! */
    // NORMAL - ROOM
    wrapSocketHandler(onNormalRoomCreate)(socketServer, socket);
    wrapSocketHandler(onNormalRoomEnter)(socketServer, socket);
    wrapSocketHandler(onNormalRoomModeChange)(socketServer, socket);
    wrapSocketHandler(onNormalRoomUserTeamChange)(socketServer, socket);
    wrapSocketHandler(onNormalRoomUserIconChange)(socketServer, socket);
    wrapSocketHandler(onNormalRoomUserTeamShuffle)(socketServer, socket);
    wrapSocketHandler(onNormalRoomGameStart)(socketServer, socket);
    wrapSocketHandler(onNormalRoomUserListGet)(socketServer, socket);
    wrapSocketHandler(onNormalRoomUserCountGet)(socketServer, socket);

    // NORMAL - IN-GAME
    wrapSocketHandler(onNormalInGameBypass)(socketServer, socket);
    wrapSocketHandler(onNormalInGame6030Do)(socketServer, socket);
    wrapSocketHandler(onNormalInGame6040Do)(socketServer, socket);
    wrapSocketHandler(onNormalInGame6040Finish)(socketServer, socket);

    // NORMAL - FINISH
    wrapSocketHandler(onNormalFinishScorePost)(socketServer, socket);
    wrapSocketHandler(onNormalFinishExit)(socketServer, socket);

    /* ! EVENT ! */
    // EVENT - ROOM
    wrapSocketHandler(onEventRoomCreate)(socketServer, socket);
    wrapSocketHandler(onEventRoomChangeMode)(socketServer, socket);
    wrapSocketHandler(onEventRoomHostReEnter)(socketServer, socket);
    wrapSocketHandler(onEventRoomEnter)(socketServer, socket);

    // EVENT - LOBBY
    wrapSocketHandler(onLobbyStartGame)(socketServer, socket);
    wrapSocketHandler(onLobbyUserCountGet)(socketServer, socket);
    wrapSocketHandler(onLobbyUserListGet)(socketServer, socket);
    wrapSocketHandler(onLobbyResetUserList)(socketServer, socket);

    // EVENT - IN_GAME
    wrapSocketHandler(onEventInGameRealTimeScorePost)(socketServer, socket);
    wrapSocketHandler(onEventInGameRealTimeScoreGet)(socketServer, socket);
    wrapSocketHandler(onEventInGameSendSeed)(socketServer, socket);

    // EVENT - FINISH
    wrapSocketHandler(onEventFinishScoreGet)(socketServer, socket);
    wrapSocketHandler(onEventFinishExit)(socketServer, socket);
    wrapSocketHandler(onEventFinishScorePost)(socketServer, socket);
    wrapSocketHandler(onEventFinishRankingGet)(socketServer, socket);
    
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