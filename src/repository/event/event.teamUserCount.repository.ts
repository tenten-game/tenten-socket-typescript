import { redisClient } from "../../config/redis.config";

export function addRoomTeamUserCount(roomNumber: string, teamId: number): void {
    const roomKey = generateKey(roomNumber, teamId);
    redisClient.incr(roomKey);
    redisClient.expire(roomKey, 1000);
}

export async function getRoomTeamUserCount(roomNumber: string, teamId: number): Promise<number> {
    const roomKey = generateKey(roomNumber, teamId);
    const count = await redisClient.get(roomKey);
    return count ? parseInt(count) : 0;
}

export function reduceRoomTeamUserCount(roomNumber: string, teamId: number): void {
    const roomKey = generateKey(roomNumber, teamId);
    redisClient.decr(roomKey);
    redisClient.expire(roomKey, 1000);
}

export function resetRoomTeamUserCount(roomNumber: string, teamId: number): void {
    const roomKey = generateKey(roomNumber, teamId);
    redisClient.set(roomKey, 0);
}

function generateKey(roomNumber: string, teamId: number): string {
    return `${roomNumber}_${teamId}_USER_COUNT`;
}