import 'dotenv/config';
import http from 'http';
import express, { ErrorRequestHandler } from 'express';
import createError, { isHttpError } from 'http-errors';
import { RequestError } from 'got';
import type { ListenError } from './types';
import { normalizePort } from './utils';
import v1Router from './router/v1/router';

const PORT = normalizePort(process.env.PORT || '3000');
const app = express();

app.set('port', PORT);
app.disable('x-powered-by');
app.set('trust proxy', true);

app.use('/api/v1', v1Router);

app.use((req, res, next) => {
  next(new createError.NotFound());
});

const errorHandler: ErrorRequestHandler = (err: Error, req, res, next) => {
  res
    .status(
      err instanceof RequestError
        ? err.response?.statusCode || 500
        : isHttpError(err)
        ? err.statusCode
        : 500
    )
    .json({ error: err.message || 'Unknown Error' });
};

app.use(errorHandler);

const server = http.createServer(app);

server.listen(PORT);

server.on('error', (error: ListenError) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
});

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : `port ${addr?.port}`;
  console.log(`app listening on ${bind}!`);
});
