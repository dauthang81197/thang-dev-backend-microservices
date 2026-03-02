import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log(
      '[JwtAuthGuard] Checking authorization header:',
      authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING',
    );

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('[JwtAuthGuard] handleRequest - Error:', err?.message);
    console.log(
      '[JwtAuthGuard] handleRequest - User:',
      user ? 'FOUND' : 'NOT FOUND',
    );
    console.log('[JwtAuthGuard] handleRequest - Info:', info?.message || info);

    if (err || !user) {
      console.error(
        '[JwtAuthGuard] ❌ Authentication failed:',
        err?.message || info?.message || 'No user',
      );
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }

    console.log('[JwtAuthGuard] ✅ Authentication successful');
    return user;
  }
}
