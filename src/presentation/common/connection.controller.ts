import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { handleEventHostDisconnected, handleEventUserDisconnected, handleNormalUserDisconnected } from "../../application/common/connection.service";
import { User } from "../../common/entity/user.entity";
import { getEventHostSocketDataRoomNumber, getSocketDataRoomNumber, getSocketDataUser, isEventHost, isEventUser, isUser } from "../../repository/socket/socket.repository";

export function onDisconnecting(
  socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('disconnecting', async (reason: DisconnectReason): Promise<void> => {
    if (isUser(socket)) {
      handleNormalUserDisconnected();
    } else if (isEventHost(socket)) {
      const roomNumber: string = getEventHostSocketDataRoomNumber(socket);
      handleEventHostDisconnected(roomNumber);
    } else if (isEventUser(socket)) {
      const roomNumber: string = getSocketDataRoomNumber(socket);
      const user: User = getSocketDataUser(socket);
      const hostSocketId: string = await handleEventUserDisconnected(roomNumber, user);
      socketServer.to(hostSocketId).emit('event.room.userDisconnected', JSON.stringify(user));
    } else { // 등록된 적 없는 유저의 끊김 - 아무것도 안함

    }
  });
}

export function onDisconnect(
  socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('disconnect', async (reason: string): Promise<void> => {
    console.log('disconnect', reason);
  });
}