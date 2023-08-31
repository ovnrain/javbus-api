import type { NextFunction, Request, Response } from 'express';
import { type ValidationChain, validationResult } from 'express-validator';

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

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    next(
      new QueryValidationError(
        'query is invalid',
        errors.array().map((error) => error.msg),
      ),
    );
  };
};

export const validate2 = <Req extends Request = Request, Res extends Response = Response>(
  validations: ValidationChain[],
  callback: (res: Res, next: NextFunction) => void,
) => {
  return async (req: Req, res: Res, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    callback(res, next);
  };
};
