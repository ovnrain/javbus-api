import fs from 'fs';
import http, { Server } from 'http';
import https from 'https';
import { normalizePort } from './utils.js';
import app from './app.js';
import type { ListenError } from './types.js';

const PORT = normalizePort(process.env.PORT || '3000');
const SSL_CERT = process.env.SSL_CERT;
const SSL_KEY = process.env.SSL_KEY;

let server: Server;
let scheme: 'http' | 'https';

if (SSL_CERT && SSL_KEY && fs.existsSync(SSL_CERT) && fs.existsSync(SSL_KEY)) {
  server = https.createServer(
    {
      cert: fs.readFileSync(SSL_CERT),
      key: fs.readFileSync(SSL_KEY),
    },
    app,
  );
  scheme = 'https';
} else {
  server = http.createServer(app);
  scheme = 'http';
}

server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

function onListening() {
  console.log(`Server is running at ${scheme}://localhost:${PORT}`);
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
