import { instrument } from '@socket.io/admin-ui';
import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from 'socket.io';
import { onDisconnect, onDisconnecting } from '../presentation/common/connection.controller';
import { onEventInGameRealTimeScoreGet, onEventInGameRealTimeScorePost } from '../presentation/event/event.ingame.controller';
import { onLobbyResetUserList, onLobbyStartGame, onLobbyUserCountGet, onLobbyUserListGet } from '../presentation/event/event.lobby.controller';
import { onEventRoomChangeMode, onEventRoomCreate, onEventRoomEnter } from '../presentation/event/event.room.controller';
import { onEventFinishExit, onEventFinishRankingGet, onEventFinishScoreGet, onEventFinishScorePost } from '../presentation/event/evnet.finish.controller';
import { onRoomChangeMode, onRoomCreate, onRoomEnter, onRoomExit } from '../presentation/normal/room.controller';
import { logger } from '../util/logger';
import { config } from './env.config';
import { redisAdapter } from "./redis.config";

export function installSocketIo(https: HttpServer): SocketServer {

  const socket = require('socket.io');
  const jwt = require('jsonwebtoken');

  const socketIO: SocketServer = socket(https, {
    pingInterval: 10000, // ping 메시지 전송 간격 (밀리초)
    pingTimeout: 5000, // ping 메시지 응답 대기 시간 (밀리초)
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
  //   if (!token) return next(new Error('THERE IS NO TOKEN'));
  //   jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
  //     if (err) return next(new Error('AUTHENTICATION ERROR'));
  //     next();
  //   });
  // });

  return socketIO;
}

export function initializeSocket(socketServer: SocketServer): void {
  socketServer.on('connection', async (socket: Socket): Promise<void> => {
    // 받는것 로깅
    if (config.env === 'development') {
      socket.onAny((event, ...args) => logger.debug(`[ON] Socket Event: ${event}, Args: ${JSON.stringify(args)}`));
      socket.onAnyOutgoing((event, ...args) => logger.debug(`[EMIT] Socket Event: ${event}, Args: ${JSON.stringify(args)}`));
      const originalEmit = socketServer.emit;
      socketServer.emit = function (event: string, ...args: any[]) {
        logger.debug(`[EMIT] Socket Event: ${event}, Args: ${JSON.stringify(args)}`);
        return originalEmit.apply(socketServer, [event, ...args]);
      }
    }

    // NORMAL APP
    // CONNECTION
    onDisconnecting(socketServer, socket);
    onDisconnect(socketServer, socket);

    // ROOM
    onRoomCreate(socketServer, socket);
    onRoomEnter(socketServer, socket);
    onRoomChangeMode(socketServer, socket);
    onRoomExit(socketServer, socket);

    // // LOBBY
    // onLobbyChangeIcon(socketServer, socket);
    // onLobbyChangeTeam(socketServer, socket);
    // onLobbyStartGame(socketServer, socket);
    // onLobbyStartMultiGame(socketServer, socket);

    // // IN-GAME
    // onInGameMultiGameReady(socketServer, socket);
    // onInGameBuzzer(socketServer, socket);
    // onInGameApt(socketServer, socket);
    // onInGameTouch(socketServer, socket);
    // onInGameScore(socketServer, socket);

    // BYPASS

    /**
     * EVENT
     */
    // ROOM - HOST
    onEventRoomCreate(socketServer, socket);
    onEventRoomChangeMode(socketServer, socket);
    // ROOM - USER
    onEventRoomEnter(socketServer, socket);

    // LOBBY - HOST
    onLobbyStartGame(socketServer, socket);
    onLobbyUserCountGet(socketServer, socket);
    onLobbyUserListGet(socketServer, socket);
    onLobbyResetUserList(socketServer, socket);

    // IN_GAME
    onEventInGameRealTimeScorePost(socketServer, socket);
    onEventInGameRealTimeScoreGet(socketServer, socket);

    // FINISH - WEB
    onEventFinishScoreGet(socketServer, socket);
    onEventFinishExit(socketServer, socket);

    // FINISH - APP
    onEventFinishScorePost(socketServer, socket);
    onEventFinishRankingGet(socketServer, socket);

  });

}
