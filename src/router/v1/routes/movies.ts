import { Router } from 'express';
import createError from 'http-errors';
import {
  getMovieDetail,
  getMoviesByPage,
  getMoviesByStarAndPage,
  getMoviesByTagAndPage,
} from '../javbusParser';
import { Movie, MovieTag, StarInfo } from '../types';
import {
  isValidMoviesPageQuery,
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
    (isValidMoviesStarAndPageQuery(query) && isValidMoviesTagAndPageQuery(query))
  ) {
    return next(new createError.BadRequest());
  }

  const page = query.page;
  const numberPage = Number(page);
  const starId = isValidMoviesStarAndPageQuery(query) ? query.starId : undefined;
  const tagId = isValidMoviesTagAndPageQuery(query) ? query.tagId : undefined;

  try {
    let response: { page: number; movies: Movie[]; star?: StarInfo; tag?: MovieTag };

    if (starId) {
      const { movies, starInfo: star } = await getMoviesByStarAndPage(starId, page, false);
      response = { page: numberPage, movies, star };
    } else if (tagId) {
      const { movies, tagInfo: tag } = await getMoviesByTagAndPage(tagId, page);
      response = { page: numberPage, movies, tag };
    } else {
      const { movies } = await getMoviesByPage(page);
      response = { page: numberPage, movies };
    }

    res.json(response);
  } catch (e) {
    next(e);
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
