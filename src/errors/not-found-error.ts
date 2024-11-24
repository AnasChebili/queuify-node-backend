import { HttpError } from './http-error';

export class NotFoundError extends HttpError {
  constructor(public message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
    Error.captureStackTrace(this, this.constructor);
  }
}
