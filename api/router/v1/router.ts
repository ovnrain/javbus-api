import { Router } from 'express';
import createError from 'http-errors';
import {
  moviesPageValidator,
  searchMoviesPageValidator,
  typeValidator,
  validate,
} from './validators.js';
import type { FilterType, MagnetType, MovieType } from './types.js';
import {
  getMovieDetail,
  getMoviesByKeywordAndPage,
  getMoviesByPage,
  getStarInfo,
} from './javbusParser.js';

const movieRouter = Router();

movieRouter.get('/', validate(moviesPageValidator), async (req, res, next) => {
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

movieRouter.get('/search', validate(searchMoviesPageValidator), async (req, res, next) => {
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

movieRouter.get('/:id', async (req, res, next) => {
  const movieId = req.params.id;

  try {
    const movie = await getMovieDetail(movieId);

    res.json(movie);
  } catch (e) {
    // 格式化一下错误
    next(e instanceof Error && e.message.includes('404') ? new createError.NotFound() : e);
  }
});

const starRouter = Router();

starRouter.get('/:id', validate([typeValidator]), async (req, res, next) => {
  const starId = req.params['id'] as string;
  const type = req.query['type'] as MovieType | undefined;

  try {
    const starInfo = await getStarInfo(starId, type);

    res.json(starInfo);
  } catch (e) {
    // 格式化一下错误
    next(e instanceof Error && e.message.includes('404') ? new createError.NotFound() : e);
  }
});

const router = Router();

router.use('/movies', movieRouter);
router.use('/stars', starRouter);

export default router;
