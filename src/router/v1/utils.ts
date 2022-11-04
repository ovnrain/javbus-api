import type { ParsedQs } from 'qs';
import { JAVBUS } from './constants';
import type {
  MoviesPageQuery,
  MoviesSearchQuery,
  MoviesStarAndPageQuery,
  MoviesTagAndPageQuery,
  StarInfoQuery,
} from './types';

export const PAGE_REG = /^[1-9]\d*$/;

export function isValidMoviesPageQuery(query: ParsedQs): query is MoviesPageQuery {
  return (
    typeof query['page'] === 'string' &&
    PAGE_REG.test(query['page']) &&
    (query['magnet'] === 'all' || query['magnet'] === 'exist') &&
    (!query['type'] || query['type'] === 'normal' || query['type'] === 'uncensored')
  );
}

export function isValidMoviesStarAndPageQuery(query: ParsedQs): query is MoviesStarAndPageQuery {
  return isValidMoviesPageQuery(query) && typeof query['starId'] === 'string';
}

export function isValidMoviesTagAndPageQuery(query: ParsedQs): query is MoviesTagAndPageQuery {
  return isValidMoviesPageQuery(query) && typeof query['tagId'] === 'string';
}

export function isValidMoviesSearchQuery(query: ParsedQs): query is MoviesSearchQuery {
  return isValidMoviesPageQuery(query) && typeof query['keyword'] === 'string';
}

export function isValidStarInfoQuery(query: ParsedQs): query is StarInfoQuery {
  return !query['type'] || query['type'] === 'normal' || query['type'] === 'uncensored';
}

export function formatImageUrl(url?: string) {
  return url && !/^http/.test(url) ? `${JAVBUS}${url}` : url;
}
