import { redisClient } from "../config/redis.config";

async function temp () {
    const scoreWithMembers = await redisClient.zrange('22134795_487616_RANKING', 0, -1)
    console.log(JSON.stringify(scoreWithMembers, null, 2));
}

temp();