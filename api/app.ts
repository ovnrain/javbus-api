import express, { type NextFunction, type Request, type Response } from 'express';
import createError, { isHttpError } from 'http-errors';
import { RequestError } from 'got';
import v1Router from './router/v1/router.js';
import { QueryValidationError } from './utils.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(express.static('public'));
app.use('/api/v1', v1Router);

app.use((_req, _res, next) => {
  next(new createError.NotFound());
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  let status: number;
  let messages: string[] = [];

  if (err instanceof QueryValidationError) {
    status = 400;
    messages = err.messages;
  } else if (err instanceof RequestError) {
    status = err.response?.statusCode || 500;
  } else if (isHttpError(err)) {
    status = err.statusCode;
  } else {
    status = 500;
  }

  res.status(status).json({ error: err.message || 'Unknown Error', messages });
});

export default app;
