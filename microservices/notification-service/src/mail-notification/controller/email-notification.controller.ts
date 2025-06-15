import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNotificationDto } from 'src/common/dto/create-notifications.dto';
import { EmailNotificationService } from '../service/email-notification.service';

@Controller()
export class EmailNotificationController {
  constructor(
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  @MessagePattern('sendEmailNotification')
  async sendMail(@Payload() createNotification: CreateNotificationDto) {
    if (createNotification.email.length > 1) {
      return await this.emailNotificationService.sendBulkMail(
        createNotification,
      );
    }
    return await this.emailNotificationService.sendMail(createNotification);
  }
}
