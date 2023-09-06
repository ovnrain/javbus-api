import fs from 'fs';
import http, { Server as HttpServer } from 'http';
import https, { Server as HttpsServer } from 'https';
import app from './app.js';
import type { ListenError } from './types.js';
import ENV from './env.js';

const { PORT, SSL_CERT, SSL_KEY } = ENV;

let server: HttpServer | HttpsServer;
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

server
  .listen(PORT, () => {
    console.log(`Server is running at ${scheme}://localhost:${PORT}`);
  })
  .on('error', onError);

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
