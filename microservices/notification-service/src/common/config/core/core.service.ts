import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface EnvConfig {
  [prop: string]: string;
}

export const NODE_ENV = 'NODE_ENV';
export const DB_NAME = 'DB_NAME';
export const DB_HOST = 'DB_HOST';
export const DB_PORT = 'DB_PORT';
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
export const MAIL_HOST = 'MAIL_HOST';
export const MAIL_PORT = 'MAIL_PORT';
export const MAIL_SECURE = 'MAIL_SECURE';
export const MAIL_IGNORE_TLS = 'MAIL_IGNORE_TLS';
export const MAIL_USER = 'MAIL_USER';
export const MAIL_PASSWORD = 'MAIL_PASSWORD';
export const MAIL_SENDER_NAME = 'MAIL_SENDER_NAME';
export const RMQ_HOST = 'RMQ_HOST';

@Injectable()
export class CoreConfigService {
  private readonly envConfig: EnvConfig;

  constructor() {
    const config = dotenv.config().parsed;
    this.envConfig = this.validateInput(config);
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'staging')
        .default('development'),
      DB_HOST: Joi.string().required(),
      DB_NAME: Joi.string().required(),
      DB_PORT: Joi.string().required(),
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
      MAIL_SENDER_NAME: Joi.string().required(),
      MAIL_HOST: Joi.string().required(),
      MAIL_PORT: Joi.number().required(),
      MAIL_SECURE: Joi.boolean().required(),
      MAIL_IGNORE_TLS: Joi.boolean().required(),
      MAIL_USER: Joi.string().required(),
      MAIL_PASSWORD: Joi.string().required(),
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
      case DB_NAME:
        return process.env.NODE_ENV === 'test'
          ? `test_${this.envConfig[key]}`
          : this.envConfig[key];
      default:
        return this.envConfig[key];
    }
  }
}
