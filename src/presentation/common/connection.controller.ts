import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { handleEventUserDisconnected, handleNormalUserDisconnected } from "../../application/common/connection.service";
import { User } from "../../common/entity/user.entity";
import { getEventHostSocketDataRoomNumber, getSocketDataRoomNumber, getSocketDataUser, isEventHost, isEventUser, isNormalUser } from "../../repository/socket/socket.repository";
import { logger } from '../../util/logger';
import { sendGoogleChatMessage } from "../../util/webhook";

export function onDisconnecting(
  socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('disconnecting', async (reason: DisconnectReason): Promise<void> => {
    let roomNumber: string;
    try {
      if (isNormalUser(socket)) {
        roomNumber = getSocketDataRoomNumber(socket);
        await handleNormalUserDisconnected(roomNumber, getSocketDataUser(socket));
        socketServer.to(roomNumber).emit('normal.connection.disconnected', JSON.stringify(getSocketDataUser(socket)));
      } else if (isEventHost(socket)) {
        roomNumber = getEventHostSocketDataRoomNumber(socket);
      } else if (isEventUser(socket)) {
        const user: User = getSocketDataUser(socket);
        roomNumber = getSocketDataRoomNumber(socket);
        const response = await handleEventUserDisconnected(roomNumber, user);
        socketServer.to(response.data.hostSocketId).emit('event.room.userDisconnected', JSON.stringify(user));
      } else { 
        // 등록된 적 없는 유저의 끊김 - 아무것도 안함
      }  
    } catch (error) {
      sendGoogleChatMessage(`Socket ${socket.id} disconnected with error: ${error}`);
    }
  });
}

export function onDisconnect(
  socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('disconnect', async (reason: string): Promise<void> => {
    logger.info(`Socket ${socket.id} disconnected: ${reason}`);
  });
}

export function onConnectError(
  socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('connect_error', async (err: Error): Promise<void> => {
    logger.error(`Socket ${socket.id} connection error:`, err);
  });
}

export function onTest(
  socketServer: SocketServer,
  socket: Socket
): void {
  // test. 으로 시작하는 모든건 모든 방에 전송
  socket.on('test.emit.realtimescore', (data: any) => {
    socketServer.to(getEventHostSocketDataRoomNumber(socket)).emit('test.realtimescore', JSON.stringify(data));
  });

  socket.on("test.emit.finalscore", (data: any) => {
    socketServer.to(getEventHostSocketDataRoomNumber(socket)).emit('test.finalscore', JSON.stringify(data));
  });
}