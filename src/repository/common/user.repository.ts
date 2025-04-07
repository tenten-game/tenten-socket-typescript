import { User } from "../../common/entity/user.entity";
import { redisClient } from "../../config/redis.config";
import { TeamUserCount, UserCount } from "./entity/userCount.dto";

export async function getRoomUserMap(
    roomNumber: string,
): Promise<Record<string, User>> {
    const userMap = await redisClient.hgetall(generateKey(roomNumber));
    const result: Record<string, User> = {};
    for (const key in userMap) {
        if (userMap.hasOwnProperty(key)) {
            const user = JSON.parse(userMap[key]);
            result[user.i] = user;
        }
    }
    return result;
}

export async function getRoomUser(
    roomNumber: string,
    userId: string,
): Promise<User | null> {
    const user: string | null = await redisClient.hget(generateKey(roomNumber), userId);
    return user ? JSON.parse(user) : null;
}

export async function setRoomUser(
    roomNumber: string,
    user: User,
): Promise<void> {
    await redisClient.hset(generateKey(roomNumber), user.i, JSON.stringify(user));
}

export async function deleteRoomUser(
    roomNumber: string,
    userId: string,
): Promise<void> {
    await redisClient.hdel(roomNumber, userId);
}

export async function addUser(
    roomNumber: string,
    user: User,
): Promise<void> {
    redisClient.zadd(
        generateKey(roomNumber),
        user.t,
        JSON.stringify(user),
    )
}

export async function getUserCount(
    roomNumber: string,
    teamIds: number[],
): Promise<UserCount> {
    const totalUserCount: number = await redisClient.zcard(generateKey(roomNumber));
    const teamUserCount: Record<number, number> = {};

    for (const teamId of teamIds) {
        const count: number = await redisClient.zcount(generateKey(roomNumber), teamId, teamId);
        teamUserCount[teamId] = count;
    }

    return new UserCount(
        totalUserCount,
        Object.entries(teamUserCount).map(([teamId, count]) => new TeamUserCount(parseInt(teamId), count)),
    )
}

export async function getUserList(
    roomNumber: string,
): Promise<Record<number, User>> {
    const userStringList: string[] = await redisClient.zrange(generateKey(roomNumber), 0, -1);
    const userMap: Record<number, User> = {};

    for (let i = 0; i < userStringList.length; i++) {
        const user: User = JSON.parse(userStringList[i]);
        if (!userMap[user.i]) {
            userMap[user.i] = user;
        }
    }
    return userMap;
}

function generateKey(roomNumber: string): string {
    return `${roomNumber}_USERLIST`;
}

