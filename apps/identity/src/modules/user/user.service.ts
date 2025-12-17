import { BadRequestException, Injectable } from '@nestjs/common';
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
    return await this.userRepository.save(user);
  }
}
