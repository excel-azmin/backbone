import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationService } from 'src/modules/notification/service/notificaion.service';
import { RequestEventEmitter } from './event-emitter.service';
@Injectable()
export class EventListener implements OnModuleInit {
  constructor(
    private readonly eventEmitter: RequestEventEmitter,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.eventEmitter.on(
      'sendNotification',
      async (notificationPayload: any) => {
        await this.notificationService.sendNotification(notificationPayload);
      },
    );
  }
}
