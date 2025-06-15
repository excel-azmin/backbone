import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BcryptService } from './bcrypt/bcypt.service';
import { DateService } from './date';
import { JsonWebTokenService } from './jwt-token/jsonwebtoken.service';

@Global()
@Module({
  imports: [JwtModule],
  providers: [BcryptService, JsonWebTokenService, DateService],
  exports: [BcryptService, JsonWebTokenService, DateService],
})
export class LibModule {}
