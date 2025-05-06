import { Room } from "../../common/entity/room.entity";
import { redisClient } from "../../config/redis.config";

export function setRoom(roomNumber: string, room: Room): void {
    redisClient.set(generateRoomKey(roomNumber), JSON.stringify(room));
}

export async function getRoom(roomNumber: string): Promise<Room> {
    const roomKey = generateRoomKey(roomNumber);
    const room: string | null = await redisClient.get(generateRoomKey(roomNumber));
    if (!room) throw Error('Event room not found');
    return JSON.parse(room);
}

function generateRoomKey(roomNumber: string): string {
    return `${roomNumber}`;
}
