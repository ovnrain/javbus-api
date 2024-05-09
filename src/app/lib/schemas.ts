import { z } from 'zod';

export const typeSchema = z.object({
  type: z.enum(['normal', 'uncensored']).default('normal'),
});

const baseMoviesPageSchema = typeSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  magnet: z.enum(['all', 'exist']).default('exist'),
});

export const moviesPageSchema = baseMoviesPageSchema
  .extend({
    filterType: z.enum(['star', 'genre', 'director', 'studio', 'label', 'series']).optional(),
    filterValue: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.filterType && data.filterValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '`filterType` is required when `filterValue` is present',
        path: ['filterType'],
      });
    }

    if (data.filterType && !data.filterValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '`filterValue` is required when `filterType` is present',
        path: ['filterValue'],
      });
    }
  });

export const searchMoviesPageSchema = baseMoviesPageSchema.extend({
  keyword: z.string().trim().min(1, { message: '`keyword` is required' }),
});

export const magnetsSchema = z
  .object({
    gid: z.string().trim().min(1, { message: '`gid` is required' }),
    uc: z.string().trim().min(1, { message: '`uc` is required' }),
    sortBy: z.enum(['date', 'size']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sortBy && !data.sortOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '`sortOrder` is required when `sortBy` is present',
        path: ['sortOrder'],
      });
    }

    if (data.sortOrder && !data.sortBy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '`sortBy` is required when `sortOrder` is present',
        path: ['sortBy'],
      });
    }
  });
