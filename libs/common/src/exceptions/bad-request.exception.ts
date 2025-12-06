import { HttpStatus } from '@nestjs/common';

import { MyHttpException } from './http.exception';

export class MyBadRequestException extends MyHttpException {
  constructor(error: string, message?: string | string[], data?: unknown) {
    super(HttpStatus.BAD_REQUEST, error, message, data);
  }
}
