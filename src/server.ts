import http from 'http';
import express from 'express';
import createError from 'http-errors';
import type { ListenError } from './types';
import { normalizePort } from './utils';
import v1Router from './router/v1/router';
import { errorHandler } from './handlers';

const PORT = normalizePort(process.env.PORT || '3000');
const app = express();

app.set('port', PORT);
app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(express.static('public'));
app.use('/api/v1', v1Router);

app.use((_req, _res, next) => {
  next(new createError.NotFound());
});

app.use(errorHandler);

const server = http.createServer(app);

server.listen(PORT);

server.on('error', (error: ListenError) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  if (error.code === 'EACCES') {
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
  } else if (error.code === 'EADDRINUSE') {
    console.error(bind + ' is already in use');
    process.exit(1);
  } else {
    throw error;
  }
});

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : `port ${addr?.port}`;
  console.log(`app listening on ${bind}!`);
});
