import Redis from 'ioredis';
import './env-config';

let redis: Redis | null = null;

if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '') {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL);

    redis.on('error', () => {
      console.warn('cannot connect to redis');
      redis?.disconnect();
      redis = null;
    });
  }
}

export default redis;
