import express from 'express';
import createError from 'http-errors';
import v1Router from './router/v1/router.mjs';
import { errorHandler } from './handlers/index.mjs';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(express.static('public'));
app.use('/api/v1', v1Router);

app.use((_req, _res, next) => {
  next(new createError.NotFound());
});

app.use(errorHandler);

export default app;
