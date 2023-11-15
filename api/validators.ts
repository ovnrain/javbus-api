import { query } from 'express-validator';

export const typeValidator = query('type')
  .optional()
  .isIn(['normal', 'uncensored'])
  .withMessage('`type` must be `normal` or `uncensored`');

const baseMoviesPageValidator = [
  query('page').default('1').isInt({ min: 1 }).withMessage('`page` must be a positive integer'),
  query('magnet')
    .default('exist')
    .isIn(['all', 'exist'])
    .withMessage('`magnet` must be `all` or `exist`'),
  typeValidator,
];

export const moviesPageValidator = [
  ...baseMoviesPageValidator,
  query('filterType')
    .optional()
    .custom((_, { req }) => {
      if (!req.query?.filterValue) {
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
      if (!req.query?.filterType) {
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

export const magnetsValidator = [
  query('gid').trim().notEmpty().withMessage('`gid` is required'),
  query('uc').trim().notEmpty().withMessage('`uc` is required'),
  query('sortBy')
    .optional()
    .custom((_, { req }) => {
      if (!req.query?.sortOrder) {
        throw new Error('`sortOrder` is required');
      }
      return true;
    })
    .trim()
    .isIn(['date', 'size'])
    .withMessage('`sortBy` must be `date` or `size`'),
  query('sortOrder')
    .optional()
    .custom((_, { req }) => {
      if (!req.query?.sortBy) {
        throw new Error('`sortBy` is required');
      }
      return true;
    })
    .trim()
    .isIn(['asc', 'desc'])
    .withMessage('`sortOrder` must be `asc` or `desc`'),
];
