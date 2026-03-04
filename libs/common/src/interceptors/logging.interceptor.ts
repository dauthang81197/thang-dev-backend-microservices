import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType();

    // Only log HTTP requests, skip microservice messages
    if (contextType !== 'http') {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, body } = request;
    const userAgent = request?.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent.substring(0, 50)}`,
    );

    // Log request body for POST/PUT/PATCH (exclude sensitive fields)
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (_data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = response.statusCode;

          // Log response
          this.logger.log(
            `📤 ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms`,
          );

          // Log slow requests (> 1000ms)
          if (duration > 1000) {
            this.logger.warn(
              `⚠️ SLOW REQUEST: ${method} ${url} took ${duration}ms`,
            );
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = error?.status || 500;

          this.logger.error(
            `❌ ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - Error: ${error?.message}`,
          );
        },
      }),
    );
  }

  /**
   * Sanitize request body - remove sensitive fields
   */
  private sanitizeBody(body: any): any {
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'creditCard',
    ];

    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized = { ...body };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitizeBody(sanitized[key]);
      }
    }

    return sanitized;
  }
}
