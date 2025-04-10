import { Room } from "../../common/entity/room.entity";
import { redisClient } from "../../config/redis.config";

export function setRoom(roomNumber: string, room: Room): void {
    redisClient.set(generateRoomKey(roomNumber), JSON.stringify(room));
}

export async function getRoom(roomNumber: string): Promise<Room> {
    const room: string | null = await redisClient.get(generateRoomKey(roomNumber));
    if (!room) throw Error('Event room not found');
    return JSON.parse(room);
}

export function expireRoomRelatedInfo(roomNumber: string): void {
    redisClient.keys(generateRoomKey(roomNumber) + "*", (err, keys) => {
        if (err) {
            console.error(err);
            return;
        }
        if (!keys) return;
        keys.forEach((key) => {
            redisClient.expire(key, 100);
        });
    });
}

function generateRoomKey(roomNumber: string): string {
    return `${roomNumber}`;
}
