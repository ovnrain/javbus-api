declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    SSL_CERT?: string;
    SSL_KEY?: string;
    HTTP_PROXY?: string;
    HTTPS_PROXY?: string;
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD?: string;
    JAVBUS_AUTH_TOKEN?: string;
    JAVBUS_SESSION_SECRET?: string;
  }
}
