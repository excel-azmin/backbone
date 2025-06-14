import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { generateOTP } from 'src/common/lib/otp/otp.service';
import {
  CreateNotificationDto,
  NotificationType,
} from 'src/modules/notification/dto/create-notificaion.dto';
import { NotificationService } from 'src/modules/notification/service/notificaion.service';
import { RegistrationCommand } from '../command/registation-command';

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand>
{
  constructor(private readonly notificationService: NotificationService) {}
  async execute(command: RegistrationCommand): Promise<any> {
    const { firstName, lastName, email } = command.registrationAuthDto;
    const otp = generateOTP(6);
    const notificationPayload: CreateNotificationDto = {
      topic: 'User Registration Verification',
      title: 'User Registration Verification',
      message: `Welcome ${firstName} ${lastName}, your registration was successful. Please verify your email address.`,
      email: [email],
      notificationType: NotificationType.EMAIL,
      data: {
        otp: otp,
      },
      fullName: `${firstName} ${lastName}`,
      mailTemplate: 'registration-verification',
      pushTokens: [],
      receiversId: [],
    };
    await this.notificationService.sendNotification(notificationPayload);
    return {
      message: 'Registration successful, verification email sent.',
      statusCode: 201,
    };
  }
}
