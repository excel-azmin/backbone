import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDefaultMailConnectionConfig } from './common/constants/mail.connection';
import { getDefaultDbConnectionString } from './common/constants/mongoose.connection';
import { ExpoNotificationModule } from './expo-notification/expo-notification.module';
import { EmailNotificationModule } from './mail-notification/email-notification.module';

@Module({
  imports: [
    MailerModule.forRoot(getDefaultMailConnectionConfig()),
    MongooseModule.forRoot(getDefaultDbConnectionString()),
    EmailNotificationModule,
    ExpoNotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
