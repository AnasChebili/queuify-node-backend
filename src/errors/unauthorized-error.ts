import { string } from 'zod';
import { HttpError } from './http-error';

export class UnauthorizedError extends HttpError {
  constructor(public message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
    Error.captureStackTrace(this, this.constructor);
  }
}
