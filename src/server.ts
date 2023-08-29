import http from 'http';
import { normalizePort } from './utils.js';
import app from './app.js';
import type { ListenError } from './types.js';

const PORT = normalizePort(process.env.PORT || '3000');

const server = http.createServer(app);

server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

function onListening() {
  console.log(`Server is running at http://localhost:${PORT}`);
}

function onError(error: ListenError) {
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
}
