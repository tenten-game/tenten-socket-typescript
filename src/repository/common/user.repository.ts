import { User } from "../../common/entity/user.entity";
import { redisClient } from "../../config/redis.config";
import { KEY_USER_IDS, KEY_USERLIST } from "../../util/redis_key_generator";
import { TeamUserCount, UserCount } from "./dto/userCount.dto";

export async function addUserToRoom(
    roomNumber: string,
    user: User,
): Promise<void> {
    redisClient.zadd(KEY_USERLIST(roomNumber), user.t, JSON.stringify(user));
    redisClient.sadd(KEY_USER_IDS(roomNumber), user.i.toString());
}

export async function deleteUserFromRoom(
    roomNumber: string,
    user: User,
): Promise<void> {
    redisClient.zrem(KEY_USERLIST(roomNumber), JSON.stringify(user));
    redisClient.srem(KEY_USER_IDS(roomNumber), JSON.stringify(user));
}

export async function getTotalUserCount(
    roomNumber: string,
): Promise<number> {
    return redisClient.zcard(KEY_USERLIST(roomNumber));
}

export function resetAllUser(
    roomNumber: string,
): void {
    redisClient.del(KEY_USERLIST(roomNumber));
}

export async function getTotalAndTeamUserCount(
    roomNumber: string,
    teamIds: number[],
): Promise<UserCount> {
    const totalUserCount: number = await redisClient.zcard(KEY_USERLIST(roomNumber));
    const teamUserCount: Record<number, number> = {};

    for (const teamId of teamIds) {
        const count: number = await redisClient.zcount(KEY_USERLIST(roomNumber), teamId, teamId);
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
    const userStringList: string[] = await redisClient.zrange(KEY_USERLIST(roomNumber), 0, -1);
    const userMap: Record<number, User> = {};

    for (let i = 0; i < userStringList.length; i++) {
        const user: User = JSON.parse(userStringList[i]);
        if (!userMap[user.i]) {
            userMap[user.i] = user;
        }
    }
    return userMap;
}

export async function updateUserIconFromRoom(
    roomNumber: string,
    user: User,
    iconId: number,
): Promise<void> {
    await redisClient.zrem(KEY_USERLIST(roomNumber), JSON.stringify(user));
    
    user.a = iconId;
    await redisClient.zadd(
        KEY_USERLIST(roomNumber),
        user.t,
        JSON.stringify(user),
    );
}

export async function updateUserTeamFromRoom(
    roomNumber: string,
    user: User,
    teamId: number,
): Promise<void> {
    await redisClient.zrem(KEY_USERLIST(roomNumber), JSON.stringify(user));
    
    // 팀 ID 업데이트 후 다시 추가
    user.t = teamId;
    await redisClient.zadd(
        KEY_USERLIST(roomNumber),
        user.t,
        JSON.stringify(user),
    );
}
