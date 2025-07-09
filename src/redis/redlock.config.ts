import redisClient from '../redis/redis.config';
import Redlock from 'redlock';

const redlock = new Redlock([redisClient], {
  retryCount: 5, // Retry up to 5 times
  retryDelay: 500, // Wait 500ms between retries
  retryJitter: 200, // Random delay to avoid collision
});

export default redlock;