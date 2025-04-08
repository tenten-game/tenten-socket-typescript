import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { getEventHostSocketDataRoomNumber, getSocketDataRoomNumber, getSocketDataUser, isEventHost, isEventUser, isUser } from "../../repository/socket/socket.repository";
import { EventUserDisconnectedResponse, handleEventHostDisconnected, handleEventUserDisconnected, handleNormalUserDisconnected } from "../../application/common/connection.service";
import { User } from "../../common/entity/user.entity";

export function onDisconnecting(
  socketServer: SocketServer,
  socket: Socket
): void {
  socketServer.on('disconnecting', async (reason: DisconnectReason): Promise<void> => {
    let needToDeleteRoom: boolean = false;

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
    }
  });
}

export function onDisconnect(
  socketServer: SocketServer,
  socket: Socket
): void {
  socketServer.on('disconnect', async (reason: string): Promise<void> => {
  });
}