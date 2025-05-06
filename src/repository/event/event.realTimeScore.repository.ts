import { redisClient } from "../../config/redis.config";

export function addRealTimeScore(roomNumber: string, match: number, teamId: number, score: number): void {
    const roomKey = generateRoomKey(roomNumber, match, teamId);
    redisClient.incrby(roomKey, score);
}

export async function getRealTimeScore(roomNumber: string, match: number, teamId: number): Promise<number> {
    const roomKey = generateRoomKey(roomNumber, match, teamId);
    const score: string | null = await redisClient.get(roomKey);
    return score ? parseInt(score) : 0;
}

function generateRoomKey(roomNumber: string, match: number, teamId: number): string {
    return `${roomNumber}_${match}_RTS_${teamId}`;
}