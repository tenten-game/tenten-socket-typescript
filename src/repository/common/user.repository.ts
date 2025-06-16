import { User } from "../../common/entity/user.entity";
import { redisClient } from "../../config/redis.config";
import { KEY_USER_DATA, KEY_USERLIST } from "../../util/redis_key_generator";
import { TeamUserCount, UserCount } from "./dto/userCount.dto";
import { logger } from "../../util/logger";

export async function addUserToRoom(
    roomNumber: string,
    user: User,
): Promise<void> {
    const userId = user.i.toString();
    const pipeline = redisClient.pipeline();
    pipeline.zadd(KEY_USERLIST(roomNumber), user.t, userId);
    pipeline.hset(KEY_USER_DATA(roomNumber), userId, JSON.stringify(user));
    await pipeline.exec();
}

export async function deleteUserFromRoom(
    roomNumber: string,
    user: User,
): Promise<void> {
    const userId = user.i.toString();
    const pipeline = redisClient.pipeline();
    pipeline.zrem(KEY_USERLIST(roomNumber), userId);
    pipeline.hdel(KEY_USER_DATA(roomNumber), userId);
    await pipeline.exec();
}

export async function getTotalUserCount(
    roomNumber: string,
): Promise<number> {
    return redisClient.zcard(KEY_USERLIST(roomNumber));
}

export async function resetAllUser(
    roomNumber: string,
): Promise<void> {
    const pipeline = redisClient.pipeline();
    pipeline.del(KEY_USERLIST(roomNumber));
    pipeline.del(KEY_USER_DATA(roomNumber));
    await pipeline.exec();
}

export async function getTotalAndTeamUserCount(
    roomNumber: string,
    teamIds: number[],
): Promise<UserCount> {
    const pipeline = redisClient.pipeline();
    pipeline.zcard(KEY_USERLIST(roomNumber));
    teamIds.forEach(teamId => {
        pipeline.zcount(KEY_USERLIST(roomNumber), teamId, teamId);
    });
    
    const results = await pipeline.exec();
    if (!results) throw new Error('Pipeline execution failed');
    
    const totalUserCount: number = results[0][1] as number;
    const teamUserCount: Record<number, number> = {};
    
    teamIds.forEach((teamId, index) => {
        teamUserCount[teamId] = results[index + 1][1] as number;
    });
    
    return new UserCount(
        totalUserCount,
        Object.entries(teamUserCount).map(([teamId, count]) => new TeamUserCount(parseInt(teamId), count)),
    )
}

export async function getUserList(
    roomNumber: string,
): Promise<Record<number, User>> {
    const userIds: string[] = await redisClient.zrange(KEY_USERLIST(roomNumber), 0, -1);
    if (userIds.length === 0) return {};
    
    const userDataList: (string | null)[] = await redisClient.hmget(KEY_USER_DATA(roomNumber), ...userIds);
    const userMap: Record<number, User> = {};
    
    for (let i = 0; i < userIds.length; i++) {
        const userData = userDataList[i];
        if (userData) {
            try {
                const user: User = JSON.parse(userData);
                userMap[user.i] = user;
            } catch (error) {
                logger.error(`Failed to parse user data for ID ${userIds[i]}:`, error);
            }
        }
    }
    return userMap;
}

export async function updateUserIconFromRoom(
    roomNumber: string,
    user: User,
    iconId: number,
): Promise<void> {
    const userId = user.i.toString();
    user.a = iconId;
    user.f = iconId;
    await redisClient.hset(KEY_USER_DATA(roomNumber), userId, JSON.stringify(user));
}

export async function updateUserTeamFromRoom(
    roomNumber: string,
    user: User,
    teamId: number,
): Promise<void> {
    const userId = user.i.toString();
    user.t = teamId;
    const pipeline = redisClient.pipeline();
    pipeline.zadd(KEY_USERLIST(roomNumber), teamId, userId);
    pipeline.hset(KEY_USER_DATA(roomNumber), userId, JSON.stringify(user));
    await pipeline.exec();
}

export async function batchUpdateUserTeams(
    roomNumber: string,
    updates: Array<{ user: User; teamId: number }>,
): Promise<void> {
    if (updates.length === 0) return;
    
    const pipeline = redisClient.pipeline();
    
    for (const { user, teamId } of updates) {
        const userId = user.i.toString();
        user.t = teamId;
        pipeline.zadd(KEY_USERLIST(roomNumber), teamId, userId);
        pipeline.hset(KEY_USER_DATA(roomNumber), userId, JSON.stringify(user));
    }
    
    await pipeline.exec();
}
