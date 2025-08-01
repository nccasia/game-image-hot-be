import { Logger } from '../logger/winston-logger.config';
import Redis, { Cluster } from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

let redisClient: Redis | Cluster;

if (process.env.USE_REDIS_CLUSTER === 'true') {
  redisClient = new Redis.Cluster([
    { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
    // Add more nodes as needed
  ]);
} else {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_AUTH || undefined,
  });
}

// Event Listeners
redisClient.on('connect', () => Logger.info('🔵 Connected to Redis'));
redisClient.on('error', (error: any) => Logger.error(`❌ Redis Error: ${error}`));

// Export Redis globally
export default redisClient;
