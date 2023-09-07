import fs from 'fs';
import http, { Server as HttpServer } from 'http';
import https, { Server as HttpsServer } from 'https';
import app from './app.js';
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
  .on('error', (e: NodeJS.ErrnoException) => {
    if (e.syscall !== 'listen') {
      throw e;
    }

    if (e.code === 'EACCES') {
      console.error(`Port ${PORT} requires elevated privileges`);
    } else if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    } else {
      throw e;
    }
  });
