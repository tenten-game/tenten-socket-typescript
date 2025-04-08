import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { handleEventHostDisconnected, handleEventUserDisconnected, handleNormalUserDisconnected } from "../../application/common/connection.service";
import { User } from "../../common/entity/user.entity";
import { getEventHostSocketDataRoomNumber, getSocketDataRoomNumber, getSocketDataUser, isEventHost, isEventUser, isUser } from "../../repository/socket/socket.repository";

export function onDisconnecting(
  socketServer: SocketServer,
  socket: Socket
): void {
  socket.on('disconnecting', async (reason: DisconnectReason): Promise<void> => {
    console.log('disconnecting', reason);
    if (isUser(socket)) {
      handleNormalUserDisconnected();
    } else if (isEventHost(socket)) {
      console.log('event host disconnected');
      const roomNumber: string = getEventHostSocketDataRoomNumber(socket);
      handleEventHostDisconnected(roomNumber);
    } else if (isEventUser(socket)) {
      console.log('event user disconnected');
      const roomNumber: string = getSocketDataRoomNumber(socket);
      const user: User = getSocketDataUser(socket);
      const hostSocketId: string = await handleEventUserDisconnected(roomNumber, user);
      socketServer.to(hostSocketId).emit('event.room.userDisconnected', JSON.stringify(user));
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