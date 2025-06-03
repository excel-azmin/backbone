import { RegistrationAuthDto } from '../dto/registration-auth.dto';

export class RegistrationCommand {
  constructor(public readonly registrationAuthDto: RegistrationAuthDto) {}
}
