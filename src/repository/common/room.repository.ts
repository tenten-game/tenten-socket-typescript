import { Room } from "../../common/entity/room.entity";
import { redisClient } from "../../config/redis.config";
import { KEY_ROOM } from "../../util/redis_key_generator";

export async function setRoom(roomNumber: string, room: Room): Promise<void> {
    await redisClient.set(KEY_ROOM(roomNumber), JSON.stringify(room));
}

export async function getRoom(roomNumber: string): Promise<Room> {
    const room: string | null = await redisClient.get(KEY_ROOM(roomNumber));
    if (!room) throw Error('Event room not found');
    return JSON.parse(room);
}

export async function deleteAllRoomData(roomNumber: string): Promise<void> {
    const pattern = `${roomNumber}*`;    
    const keys: string[] = [];
    let cursor = '0';
    
    do {
        const result = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        keys.push(...result[1]);
    } while (cursor !== '0');
    
    // Pipeline을 사용한 배치 삭제로 성능 개선
    if (keys.length > 0) {
        const pipeline = redisClient.pipeline();
        for (const key of keys) {
            pipeline.del(key);
        }
        await pipeline.exec();
    }
}
