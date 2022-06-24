import type { ParsedQs } from 'qs';
import { JAVBUS } from './constants';
import type { MoviesQuery } from './types';

export const PAGE_REG = /^[1-9]\d*$/;

export function isValidMoviesQuery(query: ParsedQs): query is MoviesQuery {
  return typeof query.page === 'string' && PAGE_REG.test(query.page);
}

export function formatImageUrl(url?: string) {
  return url && !/^http/.test(url) ? `${JAVBUS}${url}` : url;
}
