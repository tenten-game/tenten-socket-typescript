import { redisClient } from "../../config/redis.config";

export function addReady(roomNumber: string, userId: string): void {
    redisClient.sadd(generateRoomKey(roomNumber), userId);
}

export async function getReadyLength(roomNumber: string): Promise<number> {
    const length: number = await redisClient.scard(generateRoomKey(roomNumber));
    return length;
}

function generateRoomKey(roomNumber: string): string {
    return `${roomNumber}_R`;
}
