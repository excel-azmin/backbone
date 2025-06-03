import { CoreConfigService, RMQ_HOST } from '../config/core';

const config = new CoreConfigService();

export function getRmqHost() {
  return config.get(RMQ_HOST);
}
