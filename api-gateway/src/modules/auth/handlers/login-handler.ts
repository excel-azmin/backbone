import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../command/login-command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  async execute(command: LoginCommand): Promise<any> {
    return command;
  }
}
