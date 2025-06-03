import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNotificationDto } from 'src/common/dto';
import { ExpoNotificationService } from '../service/expo-notification.service';


@Controller()
export class ExpoNotificationController {
  constructor(private readonly expoNotificationService: ExpoNotificationService) {}

  @MessagePattern('sendExpoNotification')
  async send(@Payload() createExpoNotificationDto: CreateNotificationDto) {
    return await this.expoNotificationService.send(createExpoNotificationDto);
  }
  
  @MessagePattern('updateExpoNotification')
  async update(@Payload() Payload) {
    const { id, updateNotificationDto } = Payload;
    return await this.expoNotificationService.update(id, updateNotificationDto);
  }

  @MessagePattern('markAsReadAllNotification')
  async markAsReadAllNotification(@Payload() id : string) {
    return await this.expoNotificationService.markAsReadAllNotification(id);
  }


  @MessagePattern('findAllExpoNotification')
  findAll(@Payload() { page, limit, order, search, startDate, endDate }) {
    return this.expoNotificationService.findAll( page, limit, order, search, startDate, endDate);
  }

  @MessagePattern('findOneExpoNotification')
  findPUSHNotificationsBySender(@Payload() id: string) {
    return this.expoNotificationService.findPUSHNotificationsBySender(id);
  }

  @MessagePattern('findPUSHNotificationsBySender')
  notificationsByReceivers(@Payload() ids: string[]) {
    return this.expoNotificationService.findPUSHNotificationsByReceiver(ids);
  }

}
