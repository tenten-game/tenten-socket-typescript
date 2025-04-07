import { DisconnectReason, Socket, Server as SocketServer } from "socket.io";
import { getSocketDataRoomNumber, getSocketDataUser, isEventHost, isUser } from "../../repository/socket/socket.repository";

export function onDisconnecting(
    socketServer: SocketServer,
    socket: Socket
): void {
  socketServer.on('disconnecting', async (reason: DisconnectReason): Promise<void> => {
    const roomNumber = getSocketDataRoomNumber(socket);

    if(isUser(socket)){
      const user = getSocketDataUser(socket);
      socketServer.to(roomNumber).emit('user.disconnected', JSON.stringify(user));
    } else if (isEventHost(socket)) {
      const eventHost = getSocketDataUser(socket);
      socketServer.to(roomNumber).emit('eventHost.disconnected', JSON.stringify(eventHost));
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