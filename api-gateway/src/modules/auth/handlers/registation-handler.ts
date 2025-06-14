import { InjectRedis } from '@nestjs-modules/ioredis';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Redis } from 'ioredis';
import { generateOTP } from 'src/common/lib/otp/otp.service';
import { buildCacheKey } from 'src/common/utils/cache';
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
  constructor(
    private readonly notificationService: NotificationService,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async execute(command: RegistrationCommand): Promise<any> {
    const { firstName, lastName, email } = command.registrationAuthDto;
    const cachedData = this.redis.get(buildCacheKey('registration', { email }));
    if (cachedData) {
      return {
        message: 'Registration already in progress, please check your email.',
        statusCode: 400,
      };
    }
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
    await this.redis.set(
      buildCacheKey('registration', { email }),
      JSON.stringify(command.registrationAuthDto),
      'EX',
      60 * 5,
    );
    return {
      message: 'Registration successful, verification email sent.',
      statusCode: 201,
      access_token: null,
    };
  }
}
