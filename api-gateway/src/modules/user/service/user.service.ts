import { Injectable } from '@nestjs/common';
import { BcryptService } from 'src/common/lib/bcrypt/bcypt.service';
import { CustomError } from 'src/common/shared/errors/custom-eror';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
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
    const user = await this.userRepository.findByEmail(email);
    return user ? true : false;
  }

  async findUserByEmail(email: string) {
    try {
      return this.userRepository.findByEmail(email);
    } catch (error) {
      throw new CustomError('Failed to find user by email', 500, {
        message: error.message,
        statusCode: 500,
      });
    }
  }
}
