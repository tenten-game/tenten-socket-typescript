import { Room } from "../../common/entity/room.entity";
import { getRoom } from "../../repository/common/room.repository";
import { logger } from "../../util/logger";
import { sendGoogleChatMessage } from "../../util/webhook";

export function safeParseJSON(data: any): any {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    logger.error('Failed to parse JSON:', error);
    sendGoogleChatMessage(`Error parsing JSON: ${error}, data: ${JSON.stringify(data)}`);
    throw new Error('Invalid JSON format');
  }
}

export async function validateIfRequesterIsRoomMaster(userId: number, roomNumber: string): Promise<void> {
    const room: Room = await getRoom(roomNumber);
    if (!room) throw new Error(`Room ${roomNumber} does not exist`);
    
    if (userId !== room.master) {
        throw new Error(`User ${userId} is not the room master of room ${roomNumber}`);
    }
}

export async function validateIfRequesterIsRoomStarter(userId: number, roomNumber: string): Promise<void> {
    const room: Room = await getRoom(roomNumber);
    if (!room) throw new Error(`Room ${roomNumber} does not exist`);
    
    if (userId !== room.starter) {
        throw new Error(`User ${userId} is not the room master of room ${roomNumber}`);
    }
}