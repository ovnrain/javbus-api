declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    SSL_CERT?: string;
    SSL_KEY?: string;
  }
}
