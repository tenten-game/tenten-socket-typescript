import { Socket } from "socket.io";
import { User } from "../../common/entity/user.entity";
import { EventHostSocketData, SocketData } from "./entity/socket.entity";

export function setSocketDataUser(
  socket: Socket,
  user: User,
): void {
  const socketData: SocketData = socket.data;
  socketData.user = user;
}

export function getSocketDataUser(
  socket: Socket,
): User {
  const socketData: SocketData = socket.data;
  if (!socketData.user) throw new Error('유저 아이디가 없습니다.');
  return socketData.user;
}

export function getSocketDataUserId(
  socket: Socket,
): number {
  const socketData: SocketData = socket.data;
  if (!socketData.user.i) throw new Error('유저 아이디가 없습니다.');
  return socketData.user.i;
}

export function setSocketDataRoomNumber(
  socket: Socket,
  room: string,
): void {
  const socketData: SocketData = socket.data;
  socketData.roomNumber = room;
}

export function getSocketDataRoomNumber(
  socket: Socket,
): string {
  const socketData: SocketData = socket.data;
  if (!socketData.roomNumber) throw new Error('방 번호가 없습니다.');
  return socketData.roomNumber;
}

export function getSocketDataRoomNumberNullable(
  socket: Socket,
): string {
  const socketData: SocketData = socket.data;
  return socketData.roomNumber;
}

export function setEventHostSocketData(
  socket: Socket,
  eventCode: string,
  roomNumber: string,
): void {
  const eventHostSocketData: EventHostSocketData = socket.data;
  eventHostSocketData.eventCode = eventCode;
  eventHostSocketData.roomNumber = roomNumber;
}

export function getEventHostSocketDataEventCode(
  socket: Socket,
): string {
  const eventHostSocketData: EventHostSocketData = socket.data;
  if (!eventHostSocketData.eventCode) throw new Error('이벤트 코드가 없습니다.');
  return eventHostSocketData.eventCode;
}

export function getEventHostSocketDataRoomNumber(
  socket: Socket,
): string {
  const eventHostSocketData: EventHostSocketData = socket.data;
  if (!eventHostSocketData.roomNumber) throw new Error('방 번호가 없습니다.');
  return eventHostSocketData.roomNumber;
}

export function isUser(
  socket: Socket,
): boolean {
  const socketData: SocketData = socket.data;
  return !!socketData.user;
}

export function isEventHost(
  socket: Socket,
): boolean {
  const eventHostSocketData: EventHostSocketData = socket.data;
  return !!eventHostSocketData.eventCode;
}