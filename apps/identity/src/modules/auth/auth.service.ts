import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { RegisterDto } from '@app/common/dto';
import { UserService } from '../user/user.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private manager: EntityManager,
    private userService: UserService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  @Transactional()
  async register(registerDto: RegisterDto) {
    this.logger.log('Function register start !!!');
    const { email, username, password } = registerDto;
    try {
      // save user
      await this.userService.saveUser({
        email,
        username,
        passwordHash: password,
      });
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}
