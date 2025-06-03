import { HttpException } from '@nestjs/common';

export class CustomError extends HttpException {
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message, status);
    this.data = data;
  }
}
