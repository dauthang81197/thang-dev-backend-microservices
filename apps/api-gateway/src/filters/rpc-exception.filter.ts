import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { throwError } from 'rxjs';

/**
 * Bắt lỗi RpcException từ microservice và map sang HTTP response đúng status code.
 * Các service con ném: throw new RpcException({ statusCode: 404, message: '...' })
 */
@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const contextType = host.getType();

    // Nếu đang trong context HTTP (REST API)
    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      const error = exception.getError();
      this.logger.error('[RpcExceptionFilter] RPC error received:', error);

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';

      if (typeof error === 'object' && error !== null) {
        const err = error as any;
        statusCode =
          err.statusCode || err.status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = err.message || message;
      } else if (typeof error === 'string') {
        message = error;
      }

      // Map statusCode sang HTTP status hợp lệ
      const httpStatus = this.mapToHttpStatus(statusCode);

      this.logger.warn(
        `[RpcExceptionFilter] Responding with ${httpStatus}: ${message}`,
      );

      return response.status(httpStatus).json({
        statusCode: httpStatus,
        message,
        error: this.getErrorLabel(httpStatus),
        timestamp: new Date().toISOString(),
      });
    }

    // Nếu đang trong context microservice, re-throw
    return throwError(() => exception);
  }

  private mapToHttpStatus(statusCode: number): number {
    const validStatuses = [
      200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503,
    ];
    if (validStatuses.includes(statusCode)) {
      return statusCode;
    }
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
