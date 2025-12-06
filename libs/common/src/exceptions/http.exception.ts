import { HttpException, HttpStatus } from '@nestjs/common';

export class MyHttpException extends HttpException {
  constructor(
    statusCode: HttpStatus,
    error: string,
    message?: string | string[],
    data?: unknown,
  ) {
    super(
      {
        statusCode,
        error,
        message,
        data,
      },
      statusCode,
    );
  }
}
