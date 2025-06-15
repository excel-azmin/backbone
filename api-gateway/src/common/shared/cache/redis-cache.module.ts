import { Module } from '@nestjs/common';
import { RedisConfigModule } from 'src/common/config/redis/redis.connection';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [RedisConfigModule],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
