import type { ParsedQs } from 'qs';
import { JAVBUS } from './constants';
import type {
  MoviesPageQuery,
  MoviesSearchQuery,
  MoviesStarAndPageQuery,
  MoviesTagAndPageQuery,
} from './types';

export const PAGE_REG = /^[1-9]\d*$/;

export function isValidMoviesPageQuery(query: ParsedQs): query is MoviesPageQuery {
  return (
    typeof query.page === 'string' &&
    PAGE_REG.test(query.page) &&
    (query.magnet === 'all' || query.magnet === 'exist')
  );
}

export function isValidMoviesStarAndPageQuery(query: ParsedQs): query is MoviesStarAndPageQuery {
  return (
    isValidMoviesPageQuery(query) &&
    typeof query.starId === 'string' &&
    query.starId.trim().length > 0
  );
}

export function isValidMoviesTagAndPageQuery(query: ParsedQs): query is MoviesTagAndPageQuery {
  return (
    isValidMoviesPageQuery(query) &&
    typeof query.tagId === 'string' &&
    query.tagId.trim().length > 0
  );
}

export function isValidMoviesSearchQuery(query: ParsedQs): query is MoviesSearchQuery {
  return (
    isValidMoviesPageQuery(query) &&
    typeof query.keyword === 'string' &&
    query.keyword.trim().length > 0
  );
}

export function formatImageUrl(url?: string) {
  return url && !/^http/.test(url) ? `${JAVBUS}${url}` : url;
}
