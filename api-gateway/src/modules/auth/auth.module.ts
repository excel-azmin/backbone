import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RequestEventEmitterModule } from 'src/common/shared/event-emitter/event-emitter.module';
import { authCommands } from './command';
import { AuthController } from './controller/auth.controller';
import { authHandlers } from './handlers/indext';
import { AuthService } from './service/auth.service';

@Module({
  imports: [forwardRef(() => RequestEventEmitterModule), CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, ...authCommands, ...authHandlers],
})
export class AuthModule {}
