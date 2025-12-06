import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { RegisterDto } from '@app/common/dto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private manager: EntityManager,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async register(registerDto: RegisterDto) {
    this.logger.log('Function register start !!!');
    const { email, organizationName, name } = registerDto;
    console.log(email, 'adfkjh');
    try {
      return await this.manager.transaction(
        async (transactionalEntityManager) => {
          return {
            message: 'Success',
            statusCode: HttpStatus.OK,
          };
        },
      );
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}
