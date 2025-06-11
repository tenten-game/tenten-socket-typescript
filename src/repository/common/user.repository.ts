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
    redisClient.srem(`${roomNumber}_USER_IDS`, JSON.stringify(user));
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
    await redisClient.zrem(generateKey(roomNumber), JSON.stringify(user));
    
    user.a = iconId;
    await redisClient.zadd(
        generateKey(roomNumber),
        user.t,
        JSON.stringify(user),
    );
}

export async function updateUserTeamFromRoom(
    roomNumber: string,
    user: User,
    teamId: number,
): Promise<void> {
    await redisClient.zrem(generateKey(roomNumber), JSON.stringify(user));
    
    // 팀 ID 업데이트 후 다시 추가
    user.t = teamId;
    await redisClient.zadd(
        generateKey(roomNumber),
        user.t,
        JSON.stringify(user),
    );
}
