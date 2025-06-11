import { User } from "../../common/entity/user.entity";
import { redisClient } from "../../config/redis.config";
import { TeamUserCount, UserCount } from "./dto/userCount.dto";

export async function addUserToRoom(
    roomNumber: string,
    user: User,
): Promise<void> {
    redisClient.zadd(
        generateKey(roomNumber),
        user.t,
        JSON.stringify(user),
    );
    redisClient.sadd(`${roomNumber}_USER_IDS`, user.i.toString());
}

export async function deleteUserFromRoom(
    roomNumber: string,
    user: User,
): Promise<void> {
    redisClient.zrem(generateKey(roomNumber), JSON.stringify(user));
    redisClient.srem(`${roomNumber}_USER_IDS`, 0, JSON.stringify(user));
}

export async function getTotalUserCount(
    roomNumber: string,
): Promise<number> {
    return redisClient.zcard(generateKey(roomNumber));
}

export function resetAllUser(
    roomNumber: string,
): void {
    redisClient.del(generateKey(roomNumber));
}

export async function getTotalAndTeamUserCount(
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

export async function updateUserIconFromRoom(
    roomNumber: string,
    user: User,
    iconId: number,
): Promise<void> {
    
}

export async function updateUserTeamFromRoom(
    roomNumber: string,
    user: User,
    teamId: number,
): Promise<void> {
    
}

/*
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
*/