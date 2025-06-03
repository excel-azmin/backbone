import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from 'src/common/entity/notification.entity'; // ✅ Ensure correct path
import { ExpoNotificationService } from './service/expo-notification.service';
import { ExpoNotificationController } from './controller/expo-notification.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]), // ✅ Register Mongoose Model
  ],
  controllers: [ExpoNotificationController],
  providers: [ExpoNotificationService],
  exports: [ExpoNotificationService],
})
export class ExpoNotificationModule {}
