import type { NextFunction, Request, Response } from 'express';
import {
  Result,
  type ValidationChain,
  type ValidationError,
  validationResult,
} from 'express-validator';

export class QueryValidationError extends Error {
  messages: string[];

  constructor(message: string, messages?: string[]) {
    super(message);
    this.name = 'QueryValidationError';

    this.messages = messages ?? [];

    Object.setPrototypeOf(this, QueryValidationError.prototype);
  }
}

export const commonValidate = (
  validations: ValidationChain[],
  callback: (
    errors: Result<ValidationError>,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void,
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    callback(errors, req, res, next);
  };
};

export const validate = (
  validations: ValidationChain[],
): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return commonValidate(validations, (errors, req, res, next) => {
    next(
      new QueryValidationError(
        'query is invalid',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        errors.array().map((error) => error.msg),
      ),
    );
  });
};
