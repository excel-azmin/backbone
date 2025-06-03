import { EnvConfigService, RMQ_HOST } from '../env/env-config.service';

const config = new EnvConfigService();

export function getRmqHost() {
  return config.get(RMQ_HOST);
}
