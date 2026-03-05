import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Interceptor toàn cục cho API Gateway.
 * Bắt lỗi từ microservice trả về qua Observable và convert sang HttpException đúng status.
 *
 * Hỗ trợ 2 format lỗi từ microservice:
 * 1. RpcException:    error.error = { statusCode, message }
 * 2. HttpException:   error.error = { statusCode, message, error } (NestJS serialize qua Redis)
 */
@Injectable()
export class RpcToHttpExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RpcToHttpExceptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Nếu đã là HttpException (ví dụ từ Guard) thì giữ nguyên
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        this.logger.error(
          '[RpcToHttpInterceptor] Caught microservice error:',
          JSON.stringify(error),
        );

        // Lỗi từ microservice: payload nằm ở error.error
        const rpcPayload = error?.error ?? error;

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string = 'Internal server error';

        if (rpcPayload && typeof rpcPayload === 'object') {
          // HttpException hoặc RpcException serialize: { statusCode, message, error? }
          statusCode = this.toValidHttpStatus(
            rpcPayload.statusCode ?? rpcPayload.status,
          );
          // message có thể là string hoặc array (ValidationPipe)
          if (Array.isArray(rpcPayload.message)) {
            message = rpcPayload.message.join(', ');
          } else {
            message = rpcPayload.message ?? message;
          }
        } else if (typeof rpcPayload === 'string') {
          message = rpcPayload;
        }

        this.logger.warn(
          `[RpcToHttpInterceptor] → HTTP ${statusCode}: ${message}`,
        );

        return throwError(
          () =>
            new HttpException(
              {
                statusCode,
                message,
                error: this.getErrorLabel(statusCode),
                timestamp: new Date().toISOString(),
              },
              statusCode,
            ),
        );
      }),
    );
  }

  private toValidHttpStatus(code: any): number {
    const n = Number(code);
    if (!isNaN(n) && n >= 100 && n <= 599) return n;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorLabel(statusCode: number): string {
    const labels: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return labels[statusCode] || 'Error';
  }
}
