export function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

export class QueryValidationError extends Error {
  messages: string[];

  constructor(message: string, messages?: string[]) {
    super(message);
    this.name = 'QueryValidationError';

    this.messages = messages || [];

    Object.setPrototypeOf(this, QueryValidationError.prototype);
  }
}
