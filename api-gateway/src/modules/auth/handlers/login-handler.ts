import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JsonWebTokenService } from 'src/common/lib/jwt-token/jsonwebtoken.service';
import { UserService } from 'src/modules/user/service/user.service';
import { LoginCommand } from '../command/login-command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly jsonWebTokenService: JsonWebTokenService,
  ) {}
  async execute(command: LoginCommand): Promise<any> {
    const { email, password } = command.loginAuthDto;
    const loginStatus = await this.userService.validateLogin(email, password);

    return {
      message: 'Login successful',
      statusCode: 200,
      data: {
        access_token: loginStatus.access_token,
        refresh_token: loginStatus.refresh_token,
      },
    };
  }
}
