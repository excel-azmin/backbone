import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { USER_REGISTRATION_CACHE_PREFIX } from 'src/common/constants/redis-cache-prefix-constants';
import { JsonWebTokenService } from 'src/common/lib/jwt-token/jsonwebtoken.service';
import { generateOTP } from 'src/common/lib/otp/otp.service';
import { RedisCacheService } from 'src/common/shared/cache/redis-cache.service';
import {
  CreateNotificationDto,
  NotificationType,
} from 'src/modules/notification/dto/create-notificaion.dto';
import { NotificationService } from 'src/modules/notification/service/notificaion.service';
import { UserService } from 'src/modules/user/service/user.service';
import { RegistrationCommand } from '../command/registation-command';

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly redisCacheService: RedisCacheService,
    private readonly userService: UserService,
  ) {}
  async execute(command: RegistrationCommand): Promise<any> {
    try {
      const { firstName, lastName, email } = command.registrationAuthDto;

      const isUserExist = await this.userService.isAlreadyExist(email);
      if (isUserExist) {
        return {
          message: 'User already exists with this email.',
          statusCode: 400,
        };
      }

      const cachedData = await this.redisCacheService.getCacheValue(
        USER_REGISTRATION_CACHE_PREFIX,
        email,
      );

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
      await this.redisCacheService.setCache(
        USER_REGISTRATION_CACHE_PREFIX,
        email,
        { otp, ...command.registrationAuthDto },
        60 * 5,
      );
      const access_token = await this.jsonWebTokenService.generateRegisterToken(
        {
          email: email,
          firstName: firstName,
          lastName: lastName,
        },
      );

      return {
        message: 'Registration successful, verification email sent.',
        statusCode: 201,
        access_token,
      };
    } catch (error) {
      throw error;
    }
  }
}
