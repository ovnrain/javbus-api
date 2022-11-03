import { Router } from 'express';
import createError from 'http-errors';
import {
  getMovieDetail,
  getMoviesByKeywordAndPage,
  getMoviesByPage,
  getMoviesByStarAndPage,
  getMoviesByTagAndPage,
} from '../javbusParser';
import type { Movie, MovieTag, Pagination, StarInfo } from '../types';
import {
  isValidMoviesPageQuery,
  isValidMoviesSearchQuery,
  isValidMoviesStarAndPageQuery,
  isValidMoviesTagAndPageQuery,
} from '../utils';

const router = Router();

router.get('/', async (req, res, next) => {
  const query = req.query;

  if (
    (!isValidMoviesPageQuery(query) &&
      !isValidMoviesStarAndPageQuery(query) &&
      !isValidMoviesTagAndPageQuery(query)) ||
    (isValidMoviesStarAndPageQuery(query) && isValidMoviesTagAndPageQuery(query)) ||
    (isValidMoviesStarAndPageQuery(query) && !query.starId.trim().length) ||
    (isValidMoviesTagAndPageQuery(query) && !query.tagId.trim().length)
  ) {
    return next(new createError.BadRequest());
  }

  const { magnet, page } = query;
  const starId = isValidMoviesStarAndPageQuery(query) ? query.starId.trim() : undefined;
  const tagId = isValidMoviesTagAndPageQuery(query) ? query.tagId.trim() : undefined;

  try {
    let response: { movies: Movie[]; pagination: Pagination; star?: StarInfo; tag?: MovieTag };

    if (starId) {
      const {
        movies,
        pagination,
        starInfo: star,
      } = await getMoviesByStarAndPage(starId, page, magnet, false);
      response = { movies, pagination, star };
    } else if (tagId) {
      const { movies, pagination, tagInfo: tag } = await getMoviesByTagAndPage(tagId, page, magnet);
      response = { movies, pagination, tag };
    } else {
      const { movies, pagination } = await getMoviesByPage(page, magnet);
      response = { movies, pagination };
    }

    res.json(response);
  } catch (e) {
    next(e);
  }
});

router.get('/search', async (req, res, next) => {
  const query = req.query;

  if (!isValidMoviesSearchQuery(query) || !query.keyword.trim().length) {
    return next(new createError.BadRequest());
  }

  const { keyword, magnet, page } = query;

  try {
    const response = await getMoviesByKeywordAndPage(keyword.trim(), page, magnet);
    res.json(response);
  } catch (e) {
    if (e instanceof Error && e.message.includes('404')) {
      res.json({
        movies: [],
        pagination: { currentPage: Number(page), hasNextPage: false, nextPage: null, pages: [] },
        keyword,
      });
    } else {
      next(e);
    }
  }
});

router.get('/:id', async (req, res, next) => {
  const movieId = req.params.id;

  try {
    const movie = await getMovieDetail(movieId);

    res.json(movie);
  } catch (e) {
    // 格式化一下错误
    next(e instanceof Error && e.message.includes('404') ? new createError.NotFound() : e);
  }
});

export default router;
