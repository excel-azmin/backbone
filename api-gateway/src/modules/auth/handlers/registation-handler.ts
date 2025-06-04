import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestEventEmitter } from 'src/common/shared/event-emitter/event-emitter.service';
import {
  CreateNotificationDto,
  NotificationType,
} from 'src/modules/notification/dto/create-notificaion.dto';
import { RegistrationCommand } from '../command/registation-command';

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand>
{
  constructor(private readonly eventEmitter: RequestEventEmitter) {}
  async execute(command: RegistrationCommand): Promise<any> {
    const { firstName, lastName, email } = command.registrationAuthDto;
    const notificationPayload: CreateNotificationDto = {
      topic: 'User Registration Verification',
      title: 'User Registration Verification',
      message: `Welcome ${firstName} ${lastName}, your registration was successful. Please verify your email address.`,
      email: [email],
      notificationType: NotificationType.EMAIL,
      data: {
        otp: 2545,
      },
      fullName: `${firstName} ${lastName}`,
      mailTemplate: 'registration-verification',
      pushTokens: [],
      receiversId: [],
    };
    this.eventEmitter.emit('sendNotification', notificationPayload);
    return {
      message: 'Registration successful, verification email sent.',
      statusCode: 201,
    };
  }
}
