import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { USER_REGISTRATION_CACHE_PREFIX } from 'src/common/constants/redis-cache-prefix-constants';
import { JsonWebTokenService } from 'src/common/lib/jwt-token/jsonwebtoken.service';
import { RedisCacheService } from 'src/common/shared/cache/redis-cache.service';
import { NotificationService } from 'src/modules/notification/service/notificaion.service';
import { UserService } from 'src/modules/user/service/user.service';
import { VerifyRegistrationCommand } from '../command/verify-registation-command';

@CommandHandler(VerifyRegistrationCommand)
export class VerifyRegistrationHandler
  implements ICommandHandler<VerifyRegistrationCommand>
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly redisCacheService: RedisCacheService,
    private readonly userService: UserService,
  ) {}
  async execute(command: VerifyRegistrationCommand): Promise<any> {
    try {
      const { email } = command.user;
      const { otp } = command.verifyRegistrationAuthDto;
      const getVerifyingUser = await this.redisCacheService.getCacheValue(
        USER_REGISTRATION_CACHE_PREFIX,
        email,
      );
      if (!getVerifyingUser) {
        return {
          message: 'The registration process time has expired.',
          statusCode: 404,
        };
      }
      if (getVerifyingUser.otp !== otp) {
        return {
          message: 'Invalid OTP provided.',
          statusCode: 400,
        };
      }

      const user = await this.userService.createUser(getVerifyingUser);

      const [access_token, refreshToken] = await Promise.all([
        this.jsonWebTokenService.loginToken(getVerifyingUser),
        this.jsonWebTokenService.generateRefreshToken(getVerifyingUser),
      ]);

      return {
        message: 'OTP verified successfully. User registered.',
        statusCode: 200,
        access_token,
        refreshToken,
        user,
      };
    } catch (error) {
      return error;
    }
  }
}
