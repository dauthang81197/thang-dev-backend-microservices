import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  RegisterOrganizationDto,
  LoginDto,
  GoogleLoginDto,
} from '@app/common/dto';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private manager: EntityManager,
    private userService: UserService,
    private organizationService: OrganizationService,
    private jwtService: JwtService,
  ) { }

  private readonly logger = new Logger(AuthService.name);

  @Transactional()
  async register(registerDto: RegisterDto) {
    this.logger.log('Function register start !!!');
    const { email, username, password, organizationId } = registerDto;
    try {
      // save user
      await this.userService.saveUser({
        email,
        username,
        passwordHash: password,
        organizationId,
      });
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  @Transactional()
  async registerOrganization(registerOrganizationDto: RegisterOrganizationDto) {
    this.logger.log('Function registerOrganization start !!!');
    const { name, code, description, address, content, country, website } =
      registerOrganizationDto;
    try {
      // save organization
      await this.organizationService.saveOrganization({
        name,
        code,
        description,
        address,
        content,
        country,
        website,
      });
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log('Function login start !!!');
    const { email, password } = loginDto;

    try {
      // Find user by email
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash || '',
      );
      console.log('User found:', isPasswordValid);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId,
      };

      const jwtSecret = process.env.JWT_SECRET || 'supersecret';
      console.log('[Auth Service] Creating token with JWT_SECRET:', jwtSecret ? `${jwtSecret.substring(0, 5)}***` : 'UNDEFINED');

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: loginDto.rememberMe ? '7d' : '1h',
      });

      // Remove password hash from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        accessToken,
        user: userWithoutPassword,
      };
    } catch (err) {
      this.logger.error(err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new BadRequestException('Login failed');
    }
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    this.logger.log('Function googleLogin start !!!');

    try {
      // Find or create user from Google profile
      const user =
        await this.userService.findOrCreateGoogleUser(googleLoginDto);

      // Generate JWT token
      const payload = {
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId || null,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        accessToken,
        user: userWithoutPassword,
      };
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('Google login failed');
    }
  }

  async getCurrentUser(userId: string) {
    this.logger.log('Function getCurrentUser start !!!');
    try {
      // Get user profile using the existing userService method
      const user = await this.userService.getProfile(userId);

      return user;
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
