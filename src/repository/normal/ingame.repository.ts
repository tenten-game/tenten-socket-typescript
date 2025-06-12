import { User } from "../../common/entity/user.entity";
import { redisClient } from "../../config/redis.config";
import { KEY_6030, KEY_6040 } from "../../util/redis_key_generator";

export async function add6030Do(roomNumber: string, userId: number): Promise<void> {
    await redisClient.zadd(KEY_6030(roomNumber), 'NX', new Date().getTime(), userId.toString());
}

export async function get6030Do(roomNumber: string): Promise<number> {
    const userIds: string[] = await redisClient.zrange(KEY_6030(roomNumber), 0, 0);
    return userIds.length > 0 ? parseInt(userIds[0]) : 0;
}

export async function remove6030(roomNumber: string): Promise<void> {
    await redisClient.del(KEY_6030(roomNumber));
}

export async function add6040Do(roomNumber: string, user: User, floorData: number): Promise<void> {
    await redisClient.zadd(KEY_6040(roomNumber), 'NX', floorData, JSON.stringify(user));
}

export async function get6040Do(roomNumber: string): Promise<Record<number, User[]>> {
    const responseMap: Record<number, User[]> = {};
    const data = await redisClient.zrange(KEY_6040(roomNumber), 0, -1, 'WITHSCORES');

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

export async function get6040Finish(roomNumber: string): Promise<Record<number, User[]>> {
    const responseMap: Record<number, User[]> = {};
    const data = await redisClient.zrange(KEY_6040(roomNumber), 0, -1, 'WITHSCORES');

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

export async function remove6040(roomNumber: string): Promise<void> {
    await redisClient.del(KEY_6040(roomNumber));
}
