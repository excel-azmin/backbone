import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigModule } from './common/config/env/env-config.module';
import { getDefaultDbConnectionString } from './common/config/mongodb/mongodb.connection';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(getDefaultDbConnectionString()),
    AuthModule,
    EnvConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
