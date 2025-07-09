import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { handleEventUserDisconnected, handleNormalUserDisconnected, NormalDisconnectResponse } from "../../application/common/connection.service";
import { User } from "../../common/entity/user.entity";
import { getEventHostSocketDataRoomNumber, getSocketDataRoomNumber, getSocketDataUserId, hasSocketDataRoomNumber, isEventHost, isEventUser, isNormalUser } from "../../repository/socket/socket.repository";
import { registerSocketEvent } from '../../util/error.handler';
import { sendGoogleChatMessage } from "../../util/webhook";
import { getUser } from "../../repository/common/user.repository";

export function onDisconnecting(
  socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'disconnecting', async (reason: DisconnectReason): Promise<void> => {
    let roomNumber: string;
    let hasRoomNumber: boolean = hasSocketDataRoomNumber(socket);

    if (!hasRoomNumber) {
      sendGoogleChatMessage(`Socket ${socket.id} is disconnecting without room number. Reason: ${reason}`);
      return;
    }

    if (isNormalUser(socket)) {
      roomNumber = getSocketDataRoomNumber(socket);
      const disconnectResponse: NormalDisconnectResponse = await handleNormalUserDisconnected(roomNumber, getSocketDataUserId(socket));
      socketServer.to(roomNumber).emit('normal.connection.disconnected', JSON.stringify(disconnectResponse));
    } else if (isEventHost(socket)) {
      roomNumber = getEventHostSocketDataRoomNumber(socket);
    } else if (isEventUser(socket)) {
      roomNumber = getSocketDataRoomNumber(socket);
      const user: User = await getUser(roomNumber, getSocketDataUserId(socket));
      const response = await handleEventUserDisconnected(roomNumber, getSocketDataUserId(socket));
      socketServer.to(response.data.hostSocketId).emit('event.room.userDisconnected', JSON.stringify(user));
    } else {
      sendGoogleChatMessage(`Unknown socket disconnecting: ${socket.id} in room ${getSocketDataRoomNumber(socket)}`);
    }
  });
}

export function onConnectError(
  socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'connect_error', async (err: Error): Promise<void> => {
    sendGoogleChatMessage(`CONNECT_ERROR ${socket.id} connection error: ${err.message}`);
  });
}

export function onTest( // test. 으로 시작하는 모든건 모든 방에 전송
  socketServer: SocketServer,
  socket: Socket
): void {
  registerSocketEvent(socket, 'test.emit.realtimescore', (data: any) => {
    socketServer.to(getEventHostSocketDataRoomNumber(socket)).emit('test.realtimescore', JSON.stringify(data));
  });

  registerSocketEvent(socket, "test.emit.finalscore", (data: any) => {
    socketServer.to(getEventHostSocketDataRoomNumber(socket)).emit('test.finalscore', JSON.stringify(data));
  });
}