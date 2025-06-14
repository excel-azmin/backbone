import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { getRmqHost } from 'src/common/config/rmq/rmq.connection';
import { NotificationController } from './controller/notificaion.controller';
import { NotificationService } from './service/notificaion.service';
import { NotificationGateway } from './socket/notification.gateway';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${getRmqHost()}:5672`],
          queue: 'notification_queue',
          queueOptions: {
            durable: true,
          },
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
