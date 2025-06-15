import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OTPVerifyAuthGuard } from 'src/common/shared/guards/verify-auth.guard';
import { RequestWithOTP } from 'src/common/shared/interface/response';
import { LoginCommand } from '../command/login-command';
import { RegistrationCommand } from '../command/registation-command';
import { VerifyRegistrationCommand } from '../command/verify-registation-command';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { RegistrationAuthDto } from '../dto/registration-auth.dto';
import { VerifyRegistrationAuthDto } from '../dto/verify-registration-auth.dto';

@Controller('auth')
@ApiTags('Authentication and Authorization')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('v1/registration')
  async authRegistration(@Body() registrationAuthDto: RegistrationAuthDto) {
    return await this.commandBus.execute(
      new RegistrationCommand(registrationAuthDto),
    );
  }

  @Post('v1/registration/verify')
  @ApiBearerAuth()
  @UseGuards(OTPVerifyAuthGuard)
  async authRegistrationVerify(
    @Body() verifyRegistrationAuthDto: VerifyRegistrationAuthDto,
    @Req() req: RequestWithOTP,
  ) {
    return await this.commandBus.execute(
      new VerifyRegistrationCommand(verifyRegistrationAuthDto, req.user),
    );
  }

  @Post('v1/login')
  async authLogin(@Body() loginAuthDto: LoginAuthDto) {
    return await this.commandBus.execute(new LoginCommand(loginAuthDto));
  }

  // @Post('logout')
  // authLogout(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Post('refresh-token')
  // authRefreshToken(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }
  // @Post('forgot-password')
  // authForgotPassword(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }
  // @Post('reset-password')
  // authResetPassword(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get('me')
  // authMe(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }
}
