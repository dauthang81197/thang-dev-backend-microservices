import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET || 'thang2026';
    console.log(
      '[JWT Strategy] JWT_SECRET:',
      jwtSecret ? `${jwtSecret.substring(0, 5)}***` : 'UNDEFINED',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log(
      '[JWT Strategy] Validating token payload:',
      JSON.stringify(payload),
    );

    if (!payload || !payload.sub) {
      console.error('[JWT Strategy] Invalid payload - missing sub');
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
    };

    console.log('[JWT Strategy] Validation SUCCESS - User:', user);
    return user;
  }
}
