import { User } from "../../common/entity/user.entity";
import { redisClient } from "../../config/redis.config";

export async function add6030Do(roomNumber: string, userId: number): Promise<void> {
    await redisClient.zadd(`${roomNumber}_6030_DO`, 'NX', new Date().getTime(), userId.toString());
}

export async function get6030Do(roomNumber: string): Promise<number> {
    const userIds: string[] = await redisClient.zrange(`${roomNumber}_6030_DO`, 0, 0);
    return userIds.length > 0 ? parseInt(userIds[0]) : 0;
}

export async function add6040Do(roomNumber: string, user: User, floorData: number): Promise<void> {
    redisClient.zadd(`${roomNumber}_6040_DO`, 'NX', floorData, JSON.stringify(user));
}

export async function get6040Do(roomNumber: string): Promise<Record<number, User[]>> {
    const responseMap: Record<number, User[]> = {};
    const data = await redisClient.zrange(`${roomNumber}_6040`, 0, -1, 'WITHSCORES');

    for (let i = 0; i < data.length; i += 2) {
        const userData = JSON.parse(data[i]);
        const floorData = parseInt(data[i + 1]);
        const existUserIds = responseMap[floorData] || [];
        responseMap[floorData] = existUserIds.concat(userData);
    }

    for (let i = 1; i < 11; i++) {
        if (!responseMap[i]) {
            responseMap[i] = [];
        }
    }

    return responseMap;
}