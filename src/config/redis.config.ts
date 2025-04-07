import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { logger } from "../util/logger";

// Redis 클라이언트 생성
export const redisConfig: { url: string } = { url: 'redis://localhost' };
export const redisClient: Redis = new Redis(redisConfig.url);
export const redisAdapter = createAdapter(redisClient, redisClient.duplicate());

// Redis 설치 함수
export function installRedis(): void {
  redisClient.on('error', (e: Error) => {
    logger.warn('[REDIS] Error : ' + e)
  });
  redisClient.on('connect', () => {
  });
}
