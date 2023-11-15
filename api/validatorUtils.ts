import type { NextFunction, Request, Response } from 'express';
import {
  Result,
  validationResult,
  type ValidationChain,
  type ValidationError,
} from 'express-validator';

export class QueryValidationError extends Error {
  messages: string[];

  constructor(message: string, messages?: string[]) {
    super(message);
    this.name = 'QueryValidationError';

    this.messages = messages || [];

    Object.setPrototypeOf(this, QueryValidationError.prototype);
  }
}

export const commonValidate = <Req extends Request = Request, Res extends Response = Response>(
  validations: ValidationChain[],
  callback: (errors: Result<ValidationError>, req: Req, res: Res, next: NextFunction) => void,
) => {
  return async (req: Req, res: Res, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    callback(errors, req, res, next);
  };
};

export const validate = <Req extends Request = Request, Res extends Response = Response>(
  validations: ValidationChain[],
) => {
  return commonValidate<Req, Res>(validations, (errors, req, res, next) => {
    next(
      new QueryValidationError(
        'query is invalid',
        errors.array().map((error) => error.msg),
      ),
    );
  });
};
