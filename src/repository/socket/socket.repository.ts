import { Socket } from "socket.io";
import { User } from "../../common/entity/user.entity";
import { EventHostSocketData, SocketData } from "./entity/socket.entity";
import { SocketDataType } from "../../common/enums/enums";

// SET 
export function setSocketDataUserAndRoomNumber(
  socket: Socket,
  user: User,
  roomNumber: string,
  hostSocketId: string,
  socketDataType: SocketDataType,
): void {
  const socketData: SocketData = socket.data;
  socketData.user = user;
  socketData.roomNumber = roomNumber;
  socketData.socketDataType = socketDataType;
  socketData.hostSocketId = hostSocketId;
}

export function setEventHostSocketData(
  socket: Socket,
  roomNumber: string,
): void {
  const eventHostSocketData: EventHostSocketData = socket.data;
  eventHostSocketData.roomNumber = roomNumber;
  eventHostSocketData.socketDataType = SocketDataType.EVENT_HOST;
}

// GET
export function getSocketDataUser(
  socket: Socket,
): User {
  const socketData: SocketData = socket.data;
  if (!socketData.user) throw new Error('유저가 없습니다.');
  return socketData.user;
}

export function getSocketDataRoomNumber(
  socket: Socket,
): string {
  const socketData: SocketData = socket.data;
  if (!socketData.roomNumber) throw new Error('방 번호가 없습니다.');
  return socketData.roomNumber;
}

export function getEventHostSocketDataRoomNumber(
  socket: Socket,
): string {
  const eventHostSocketData: EventHostSocketData = socket.data;
  if (!eventHostSocketData.roomNumber) throw new Error('방 번호가 없습니다.');
  return eventHostSocketData.roomNumber;
}

// IS
export function isNormalUser(
  socket: Socket,
): boolean {
  const socketData: SocketData = socket.data;
  return socketData.socketDataType === SocketDataType.NORMAL_USER;
}

export function isEventHost(
  socket: Socket,
): boolean {
  const eventHostSocketData: EventHostSocketData = socket.data;
  return eventHostSocketData.socketDataType === SocketDataType.EVENT_HOST;
}

export function isEventUser(
  socket: Socket,
): boolean {
  const eventHostSocketData: EventHostSocketData = socket.data;
  return eventHostSocketData.socketDataType === SocketDataType.EVENT_USER;
}