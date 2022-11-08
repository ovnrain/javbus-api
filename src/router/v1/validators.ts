import type { NextFunction, Request, Response } from 'express';
import { query, ValidationChain, validationResult } from 'express-validator';
import { QueryValidationError } from '../../utils';

export const typeValidator = query('type')
  .optional()
  .isIn(['normal', 'uncensored'])
  .withMessage('`type` must be `normal` or `uncensored`');

const baseMoviesPageValidator = [
  query('page').isInt({ min: 1 }).withMessage('`page` must be a positive integer'),
  query('magnet').isIn(['all', 'exist']).withMessage('`magnet` must be `all` or `exist`'),
  typeValidator,
];

export const moviesPageValidator = [
  ...baseMoviesPageValidator,
  query('starId').optional().trim(),
  query('tagId')
    .optional()
    .trim()
    .custom((_, { req }) => {
      if (req.query?.starId) {
        throw new Error('`starId` and `tagId` cannot be used at the same time');
      }
      return true;
    }),
];

export const searchMoviesPageValidator = [
  ...baseMoviesPageValidator,
  query('keyword').trim().notEmpty().withMessage('`keyword` is required'),
];

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    next(
      new QueryValidationError(
        'query is invalid',
        errors.array().map((error) => error.msg)
      )
    );
  };
};
