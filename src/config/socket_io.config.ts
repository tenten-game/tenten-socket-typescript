import { instrument } from '@socket.io/admin-ui';
import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from 'socket.io';
import { onConnectError, onDisconnecting, onTest } from '../presentation/common/connection.controller';
import { onEventFinishExit, onEventFinishRankingGet, onEventFinishScoreGet, onEventFinishScorePost } from '../presentation/event/event.finish.controller';
import { onEventInGameRealTimeScoreGet, onEventInGameRealTimeScorePost, onEventInGameSendSeed } from '../presentation/event/event.ingame.controller';
import { onLobbyResetUserList, onLobbyStartGame, onLobbyUserCountGet, onLobbyUserListGet } from '../presentation/event/event.lobby.controller';
import { onEventRoomChangeMode, onEventRoomCreate, onEventRoomEnter, onEventRoomHostReEnter } from '../presentation/event/event.room.controller';
import { onNormalFinishExit, onNormalFinishScorePost } from '../presentation/normal/normal.finish.controller';
import { onNormalInGame6030Do, onNormalInGame6040Do, onNormalInGame6040Finish, onNormalBypass } from '../presentation/normal/normal.ingame.controller';
import { onNormalRoomCreate, onNormalRoomEnter, onNormalRoomGameStart, onNormalRoomLeave, onNormalRoomModeChange, onNormalRoomReenter, onNormalRoomUserCountGet, onNormalRoomUserIconChange, onNormalRoomUserListGet, onNormalRoomUserTeamChange, onNormalRoomUserTeamShuffle } from '../presentation/normal/normal.room.controller';
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
    onDisconnecting(socketServer, socket);
    onConnectError(socketServer, socket);

    /* ! NORMAL ! */
    // NORMAL - ROOM
    onNormalRoomCreate(socketServer, socket); // 방 생성
    onNormalRoomEnter(socketServer, socket); // 방 입장
    onNormalRoomReenter(socketServer, socket); // 방 재입장 (끊긴사람)
    onNormalRoomLeave(socketServer, socket); // 방 나가기

    onNormalRoomModeChange(socketServer, socket); // 방 모드 변경
    onNormalRoomUserTeamChange(socketServer, socket); // 방 유저 팀 변경
    onNormalRoomUserIconChange(socketServer, socket); // 방 유저 스킨 변경
    onNormalRoomUserTeamShuffle(socketServer, socket); // 방 유저 팀 셔플

    onNormalRoomGameStart(socketServer, socket); // 방 게임 시작

    onNormalRoomUserListGet(socketServer, socket); // 방 유저 리스트 가져오기
    onNormalRoomUserCountGet(socketServer, socket); // 방 유저 수 가져오기

    // NORMAL - IN-GAME
    onNormalBypass(socketServer, socket);
    onNormalInGame6030Do(socketServer, socket);
    onNormalInGame6040Do(socketServer, socket);
    onNormalInGame6040Finish(socketServer, socket);

    // NORMAL - FINISH
    onNormalFinishScorePost(socketServer, socket);
    onNormalFinishExit(socketServer, socket);

    /* ! EVENT ! */
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
    console.log('DEVELOPMENT');
    socket.onAny((event, ...args) => console.log(`[ON] Socket Event: ${event}, Args: ${JSON.stringify(args)}, Socket ID: ${socket.id}, IP: ${socket.handshake.address}, UA: ${socket.handshake.headers['user-agent']}`));
    socket.onAnyOutgoing((event, ...args) => console.log(`[EMIT] Socket Event: ${event}, Args: ${JSON.stringify(args)}, Socket ID: ${socket.id}, IP: ${socket.handshake.address}, UA: ${socket.handshake.headers['user-agent']}`));
    const originalEmit = socketServer.emit;
    socketServer.emit = function (event: string, ...args: unknown[]) {
      console.log(`[EMIT] Socket Event: ${event}, Args: ${JSON.stringify(args)}`);
      return originalEmit.apply(socketServer, [event, ...args]);
    }
  } else if (config.env === 'test') {
    onTest(socketServer, socket);
  }
}