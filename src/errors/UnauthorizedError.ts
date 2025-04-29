export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
  }
}
