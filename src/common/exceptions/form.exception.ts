import { HttpException, HttpStatus } from '@nestjs/common';

export class FormHttpException extends HttpException {
  constructor(message: { property: string; message: string }[]) {
    const response = {
      message,
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
    };
    super(response, HttpStatus.BAD_REQUEST);
  }
}
