import { HttpError } from './http-error';

export class ServerError extends HttpError {
  constructor(public message: string) {
    super(message, 500);
    this.name = 'serverError';
    Error.captureStackTrace(this, this.constructor);
  }
}
