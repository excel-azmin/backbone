import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { EnvConfigService } from '../env/env-config.service'; // Ensure you're importing the correct service

// Factory function to generate Redis connection string
export const generateRedisUrl = async (
  configService: EnvConfigService,
): Promise<RedisModuleOptions> => {
  // Fetch values from EnvConfigService
  const host = configService.get('REDIS_HOST');
  const port = +configService.get('REDIS_PORT');
  const url = `redis://${host}:${port}/`;
  return {
    type: 'single',
    url,
  };
};

export const RedisConfigModule = RedisModule.forRootAsync({
  useFactory: async (configService: EnvConfigService) =>
    generateRedisUrl(configService),
  inject: [EnvConfigService],
});
