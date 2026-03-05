import { HttpException, HttpStatus } from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Pipe cho Observable từ microservice.
 * Bắt lỗi RpcException ({ statusCode, message }) và ném ra HttpException
 * để NestJS trả đúng HTTP status code về client.
 *
 * Dùng: return this.client.send(...).pipe(handleRpcError());
 */
export function handleRpcError() {
  return (source: Observable<any>): Observable<any> =>
    source.pipe(
      catchError((error) => {
        // Lỗi từ RpcException thường nằm ở error.error hoặc chính error
        const rpcError = error?.error ?? error;

        if (rpcError && typeof rpcError === 'object') {
          const statusCode: number =
            rpcError.statusCode ||
            rpcError.status ||
            HttpStatus.INTERNAL_SERVER_ERROR;
          const message: string = rpcError.message || 'Internal server error';

          return throwError(
            () => new HttpException({ message, statusCode }, statusCode),
          );
        }

        if (typeof rpcError === 'string') {
          return throwError(
            () =>
              new HttpException(
                {
                  message: rpcError,
                  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        }

        return throwError(
          () =>
            new HttpException(
              {
                message: 'Internal server error',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
}
