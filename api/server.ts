import fs from 'node:fs'
import http, { type Server as HttpServer } from 'node:http'
import https, { type Server as HttpsServer } from 'node:https'

import app from './app.js'
import ENV from './env.js'

const { PORT, SSL_CERT, SSL_KEY } = ENV

const requestListener: http.RequestListener = (req, res) => {
  app(req, res)
}

let server: HttpServer | HttpsServer
let scheme: 'http' | 'https'

if (SSL_CERT && SSL_KEY && fs.existsSync(SSL_CERT) && fs.existsSync(SSL_KEY)) {
  server = https.createServer(
    {
      cert: fs.readFileSync(SSL_CERT),
      key: fs.readFileSync(SSL_KEY),
    },
    requestListener,
  )
  scheme = 'https'
} else {
  server = http.createServer(requestListener)
  scheme = 'http'
}

server
  .listen(PORT, () => {
    console.log(`Server is running at ${scheme}://localhost:${PORT}`)
  })
  .on('error', (e: NodeJS.ErrnoException) => {
    if (e.syscall !== 'listen') {
      throw e
    }

    if (e.code === 'EACCES') {
      console.error(`Port ${PORT} requires elevated privileges`)
    } else if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`)
    } else {
      throw e
    }
  })
