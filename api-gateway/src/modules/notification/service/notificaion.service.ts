import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CustomError } from 'src/common/shared/errors/custom-eror';
import {
  CreateNotificationDto,
  NotificationType,
} from '../dto/create-notificaion.dto';
import { UpdateNotificationDto } from '../dto/update-notificaion.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendNotification(createNotificationDto: CreateNotificationDto) {
    try {
      if (createNotificationDto.notificationType === NotificationType.PUSH) {
        this.client.emit('sendExpoNotification', createNotificationDto);
      } else if (
        createNotificationDto.notificationType === NotificationType.EMAIL
      ) {
        this.client.emit('sendEmailNotification', createNotificationDto);
      } else {
        this.client.emit('sendExpoNotification', createNotificationDto);
        this.client.emit('sendEmailNotification', createNotificationDto);
      }

      return { status: 'Notification emitted successfully' };
    } catch (error) {
      console.error('Error emitting notification:', error);
      throw new CustomError(
        error.message,
        error.statusCode || 500,
        error.message,
      );
    }
  }

  async updateExpoNotification(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ) {
    const result = this.client.send('updateExpoNotification', {
      id,
      updateNotificationDto,
    });
    const response = await firstValueFrom(result);
    return response;
  }

  async markAsReadAllNotification(id: string) {
    const result = this.client.send('markAsReadAllNotification', id);
    const response = await firstValueFrom(result);
    return response;
  }

  async getNotification(
    page: number,
    limit: number,
    order: string,
    search: string,
    startDate: Date,
    endDate: Date,
  ) {
    const result = this.client.send('findAllExpoNotification', {
      page,
      limit,
      order,
      search,
      startDate,
      endDate,
    });

    const response = await firstValueFrom(result);
    return response;
  }

  async getNotificationsByReceiversId(ids: string[]) {
    const result = this.client.send('findPUSHNotificationsBySender', ids);
    const response = await firstValueFrom(result);
    return response;
  }

  async getNotificationById(id: string) {
    const result = this.client.send('findOneExpoNotification', id);
    const response = await firstValueFrom(result);
    if (!response) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    return response;
  }
}
