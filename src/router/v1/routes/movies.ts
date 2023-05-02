import { Router } from 'express';
import createError from 'http-errors';
import { getMovieDetail, getMoviesByKeywordAndPage, getMoviesByPage } from '../javbusParser.js';
import type { FilterType, MagnetType, MovieType } from '../types.js';
import { moviesPageValidator, searchMoviesPageValidator, validate } from '../validators.js';

const router = Router();

router.get('/', validate(moviesPageValidator), async (req, res, next) => {
  const query = req.query;

  const page = query['page'] as string;
  const magnet = query['magnet'] as MagnetType;
  const type = query['type'] as MovieType | undefined;
  const filterType = query['filterType'] as FilterType | undefined;
  const filterValue = query['filterValue'] as string | undefined;

  try {
    const response = await getMoviesByPage(page, magnet, type, filterType, filterValue);

    res.json(response);
  } catch (e) {
    next(e);
  }
});

router.get('/search', validate(searchMoviesPageValidator), async (req, res, next) => {
  const query = req.query;

  const page = query['page'] as string;
  const magnet = query['magnet'] as MagnetType;
  const type = query['type'] as MovieType | undefined;
  const keyword = query['keyword'] as string;

  try {
    const response = await getMoviesByKeywordAndPage(keyword.trim(), page, magnet, type);
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
