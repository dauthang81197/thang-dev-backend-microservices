import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { AuthProvider, UserEntity } from '../../shareds/entities';
import { GoogleLoginDto } from '@app/common/dto';

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

  async findByGoogleId(googleId: string) {
    return await this.userRepository.findOne({
      where: { googleId },
      relations: ['organization'],
    });
  }

  async findOrCreateGoogleUser(
    googleLoginDto: GoogleLoginDto,
  ): Promise<UserEntity> {
    const { googleId, email, firstName, lastName, fullName, avatar } =
      googleLoginDto;

    // 1. Try to find by googleId
    let user = await this.findByGoogleId(googleId);
    if (user) {
      // Update avatar if changed
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await this.userRepository.save(user);
      }
      return user;
    }

    // 2. Try to find by email (user may have registered with email/password before)
    user = await this.findByEmail(email);
    if (user) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.authProvider = AuthProvider.GOOGLE;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      if (firstName && !user.firstName) {
        user.firstName = firstName;
      }
      if (lastName && !user.lastName) {
        user.lastName = lastName;
      }
      if (fullName && !user.fullName) {
        user.fullName = fullName;
      }
      await this.userRepository.save(user);
      return user;
    }

    // 3. Create new user
    const newUser: Partial<UserEntity> = {
      email,
      googleId,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      fullName: fullName || email.split('@')[0],
      username: email.split('@')[0],
      avatar: avatar || undefined,
      authProvider: AuthProvider.GOOGLE,
      passwordHash: undefined, // No password for Google users
    };

    return await this.userRepository.save(newUser);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
