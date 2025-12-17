import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from '../../shareds/entities';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async saveUser(user: Partial<UserEntity>) {
    const userFind = await this.userRepository.findOne({
      where: [{ email: user.email }, { username: user.username }],
    });
    if (userFind) {
      throw new BadRequestException('User exits');
    }
    console.log(user, 'sdaflk');
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organization', 'userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
