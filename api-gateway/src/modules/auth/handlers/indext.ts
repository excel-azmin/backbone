import { LoginHandler } from './login-handler';
import { RegistrationHandler } from './registation-handler';
import { VerifyRegistrationHandler } from './verify-registation-handler';

export const authHandlers = [
  LoginHandler,
  RegistrationHandler,
  VerifyRegistrationHandler,
];
