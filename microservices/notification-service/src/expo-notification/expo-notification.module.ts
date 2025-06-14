import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from 'src/common/entity/notification.entity'; // ✅ Ensure correct path
import { ExpoNotificationController } from './controller/expo-notification.controller';
import { ExpoNotificationService } from './service/expo-notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [ExpoNotificationController],
  providers: [ExpoNotificationService],
  exports: [ExpoNotificationService],
})
export class ExpoNotificationModule {}
