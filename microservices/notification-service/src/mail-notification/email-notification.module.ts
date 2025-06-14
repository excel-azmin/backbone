import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from 'src/common/entity/notification.entity';
import { httpConfig } from 'src/common/module/http/http-config';
import { EmailNotificationController } from './controller/email-notification.controller';
import { EmailNotificationService } from './service/email-notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    HttpModule.register(httpConfig),
  ],
  controllers: [EmailNotificationController],
  providers: [EmailNotificationService],
})
export class EmailNotificationModule {}
