import type { NextFunction, Request, Response } from 'express';
import { RequestError } from 'got';
import { isHttpError } from 'http-errors';

export default function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let status: number;

  if (err instanceof RequestError) {
    status = err.response?.statusCode || 500;
  } else if (isHttpError(err)) {
    status = err.statusCode;
  } else {
    status = 500;
  }

  res.status(status).json({ error: err.message || 'Unknown Error' });
}
