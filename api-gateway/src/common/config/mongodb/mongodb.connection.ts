import {
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  EnvConfigService,
  MONGO_REPLICA_PRIMARY,
  MONGO_REPLICA_PRIMARY_PORT,
  MONGO_REPLICA_SECONDARY_1,
  MONGO_REPLICA_SECONDARY_1_PORT,
  MONGO_REPLICA_SECONDARY_2,
  MONGO_REPLICA_SECONDARY_2_PORT,
  MONGO_URI_PREFIX,
  READ_PREFERENCE,
  REPLICA_SET_NAME,
} from '../env/env-config.service';

const config = new EnvConfigService();

export function getDefaultDbConnectionString(): string {
  const mongoUriPrefix = config.get(MONGO_URI_PREFIX) || 'mongodb';
  const mongoOptions = 'retryWrites=true';

  return `${mongoUriPrefix}://${config.get(DB_USER)}:${config.get(
    DB_PASSWORD,
  )}@${config.get(MONGO_REPLICA_PRIMARY)}:${config.get(
    MONGO_REPLICA_PRIMARY_PORT,
  )},${config.get(MONGO_REPLICA_SECONDARY_1)}:${config.get(
    MONGO_REPLICA_SECONDARY_1_PORT,
  )},${config.get(MONGO_REPLICA_SECONDARY_2)}:${config.get(
    MONGO_REPLICA_SECONDARY_2_PORT,
  )}/${config.get(DB_NAME)}?replicaSet=${config.get(
    REPLICA_SET_NAME,
  )}&readPreference=${config.get(READ_PREFERENCE)}&${mongoOptions}`;
}
