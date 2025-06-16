import { redisClient } from "../../config/redis.config";
import { KEY_REALTIME_SCORE } from "../../util/redis_key_generator";

export async function addRealTimeScore(roomNumber: string, match: number, teamId: number, score: number): Promise<void> {
    await redisClient.incrby(KEY_REALTIME_SCORE(roomNumber, match, teamId), score);
}

export async function getRealTimeScore(roomNumber: string, match: number, teamId: number): Promise<number> {
    const score: string | null = await redisClient.get(KEY_REALTIME_SCORE(roomNumber, match, teamId));
    return score ? parseInt(score) : 0;
}
