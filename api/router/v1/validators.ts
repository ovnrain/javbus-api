import type { NextFunction, Request, Response } from 'express';
import { query, type ValidationChain, validationResult } from 'express-validator';
import { QueryValidationError } from '../../utils.js';

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
  query('filterType')
    .optional()
    .custom((_, { req }) => {
      if (!req.query?.['filterValue']) {
        throw new Error('`filterValue` is required');
      }
      return true;
    })
    .trim()
    .isIn(['star', 'genre', 'director', 'studio', 'label', 'series'])
    .withMessage('`filterType` must be `star`, `genre`, `director`, `studio`, `label` or `series`'),
  query('filterValue')
    .optional()
    .custom((_, { req }) => {
      if (!req.query?.['filterType']) {
        throw new Error('`filterType` is required');
      }
      return true;
    })
    .trim(),
];

export const searchMoviesPageValidator = [
  ...baseMoviesPageValidator,
  query('keyword').trim().notEmpty().withMessage('`keyword` is required'),
];

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
