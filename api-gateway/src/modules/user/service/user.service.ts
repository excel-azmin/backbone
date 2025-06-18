import { Injectable } from '@nestjs/common';
import { BcryptService } from 'src/common/lib/bcrypt/bcypt.service';
import { JsonWebTokenService } from 'src/common/lib/jwt-token/jsonwebtoken.service';
import { CustomError } from 'src/common/shared/errors/custom-eror';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
    private readonly jsonWebTokenService: JsonWebTokenService,
  ) {}

  async createUser(createUser: CreateUserDto) {
    try {
      const { email, password } = createUser;
      await this.isAlreadyExist(email);
      const hashedPassword = await this.bcryptService.hash(password);
      createUser.password = hashedPassword;
      return this.userRepository.create(createUser);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create user', 500, {
        message: error.message,
        statusCode: 500,
      });
    }
  }

  async isAlreadyExist(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async validateLogin(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError('User not found', 404, {
        message: 'User not found with this email.',
        statusCode: 404,
      });
    }

    const isPasswordValid = await this.bcryptService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new CustomError('Invalid password', 401, {
        message: 'Invalid password.',
        statusCode: 401,
      });
    }

    const [access_token, refresh_token] = await Promise.all([
      this.jsonWebTokenService.loginToken({ id: user.email }),
      this.jsonWebTokenService.generateRefreshToken(user.email),
    ]);

    return { access_token, refresh_token };
  }

  async findUserByEmail(email: string) {
    try {
      return this.userRepository.findByEmail(email) ? true : false;
    } catch (error) {
      throw new CustomError('Failed to find user by email', 500, {
        message: error.message,
        statusCode: 500,
      });
    }
  }
}
