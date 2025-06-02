import {
  EnvConfigService,
  REDIS_HOST,
  REDIS_PORT,
} from '../env/env-config.service';

const config = new EnvConfigService();

export function redisConnectionString(): {
  connection: {
    host: string;
    port: number;
  };
} {
  return {
    connection: {
      host: config.get(REDIS_HOST),
      port: +config.get(REDIS_PORT),
    },
  };
}
