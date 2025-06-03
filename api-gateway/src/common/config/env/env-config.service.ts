import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface EnvConfig {
  [prop: string]: string;
}

export const NODE_ENV = 'NODE_ENV';
export const DB_NAME = 'DB_NAME';
export const DB_HOST = 'DB_HOST';
export const DB_USER = 'DB_USER';
export const DB_PASSWORD = 'DB_PASSWORD';
export const MONGO_URI_PREFIX = 'MONGO_URI_PREFIX';
export const CACHE_DB_NAME = 'CACHE_DB_NAME';
export const CACHE_DB_USER = 'CACHE_DB_USER';
export const CACHE_DB_PASSWORD = 'CACHE_DB_PASSWORD';
export const AGENDA_JOBS_CONCURRENCY = 'AGENDA_JOBS_CONCURRENCY';
export const MONGO_REPLICA_PRIMARY = 'MONGO_REPLICA_PRIMARY';
export const MONGO_REPLICA_SECONDARY_1 = 'MONGO_REPLICA_SECONDARY_1';
export const MONGO_REPLICA_SECONDARY_2 = 'MONGO_REPLICA_SECONDARY_2';
export const MONGO_REPLICA_PRIMARY_PORT = 'MONGO_REPLICA_PRIMARY_PORT';
export const MONGO_REPLICA_SECONDARY_1_PORT = 'MONGO_REPLICA_SECONDARY_1_PORT';
export const MONGO_REPLICA_SECONDARY_2_PORT = 'MONGO_REPLICA_SECONDARY_2_PORT';
export const READ_PREFERENCE = 'READ_PREFERENCE';
export const REPLICA_SET_NAME = 'REPLICA_SET_NAME';
export const JWT_ALGORITHM = 'JWT_ALGORITHM';
export const JWT_SECRET = 'JWT_SECRET';
export const JWT_EXPIRES_IN = 'JWT_EXPIRES_IN';
export const LOGIN_EXPIRES_IN = 'LOGIN_EXPIRES_IN';
export const REFRESH_SECRET = 'REFRESH_SECRET';
export const REFRESH_EXPIRES_IN = 'REFRESH_EXPIRES_IN';
export const LOGIN_SECRET = 'LOGIN_SECRET';
export const WEBHOOK_SECRET = 'WEBHOOK_SECRET';
export const REDIS_HOST = 'REDIS_HOST';
export const REDIS_PORT = 'REDIS_PORT';
export const RMQ_HOST = 'RMQ_HOST';

@Injectable()
export class EnvConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const config = dotenv.config().parsed;
    this.envConfig = this.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision', 'staging')
        .default('development'),
      DB_NAME: Joi.string().required(),
      DB_HOST: Joi.string().required(),
      DB_USER: Joi.string().required(),
      DB_PASSWORD: Joi.string().required(),
      MONGO_REPLICA_PRIMARY: Joi.string().required(),
      MONGO_REPLICA_SECONDARY_1: Joi.string().required(),
      MONGO_REPLICA_SECONDARY_2: Joi.string().required(),
      MONGO_REPLICA_PRIMARY_PORT: Joi.string().required(),
      MONGO_REPLICA_SECONDARY_1_PORT: Joi.string().required(),
      MONGO_REPLICA_SECONDARY_2_PORT: Joi.string().required(),
      READ_PREFERENCE: Joi.string().required(),
      REPLICA_SET_NAME: Joi.string().required(),
      MONGO_URI_PREFIX: Joi.string().optional(),
      JWT_ALGORITHM: Joi.string()
        .valid('HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512')
        .default('HS256'),
      JWT_SECRET: Joi.string().required(),
      JWT_EXPIRES_IN: Joi.string().default('1h'),
      LOGIN_SECRET: Joi.string().required(),
      LOGIN_EXPIRES_IN: Joi.string().default('15m'),
      REFRESH_SECRET: Joi.string().required(),
      REFRESH_EXPIRES_IN: Joi.string().default('7d'),
      WEBHOOK_SECRET: Joi.string().required(),
      REDIS_HOST: Joi.string().required(),
      REDIS_PORT: Joi.number().required(),
      RMQ_HOST: Joi.string().required(),
    });

    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfig);
    if (error) {
      Logger.error(error, error.stack, this.constructor.name);
      process.exit(1);
    }
    return validatedEnvConfig;
  }

  get(key: string): string {
    switch (key) {
      case DB_NAME || CACHE_DB_NAME:
        return process.env.NODE_ENV === 'test'
          ? `test_${this.envConfig[key]}`
          : this.envConfig[key];
      default:
        return this.envConfig[key];
    }
  }
}
