export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}
