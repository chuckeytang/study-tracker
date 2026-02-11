// src/lib/redis.ts
import Redis from 'ioredis';

// [!] 注意：这里要用 6381 端口，对应你刚才 Docker 映射的端口
// 如果你的 .env 还没配，这里会用默认的 fallback 值
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6381');

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;