import { Router } from 'express';
import createError from 'http-errors';
import {
  magnetsValidator,
  moviesPageValidator,
  searchMoviesPageValidator,
  typeValidator,
} from './validators.js';
import type { FilterType, MagnetType, MovieType, SortBy, SortOrder } from './types.js';
import {
  getMovieDetail,
  getMovieMagnets,
  getMoviesByKeywordAndPage,
  getMoviesByPage,
  getStarInfo,
} from './javbusParser.js';
import { validate } from './validatorUtils.js';

const movieRouter = Router();

movieRouter.get('/', validate(moviesPageValidator), async (req, res, next) => {
  const query = req.query;

  const page = query.page as string;
  const magnet = query.magnet as MagnetType;
  const type = query.type as MovieType | undefined;
  const filterType = query.filterType as FilterType | undefined;
  const filterValue = query.filterValue as string | undefined;

  try {
    const response = await getMoviesByPage(page, magnet, type, filterType, filterValue);

    res.json(response);
  } catch (e) {
    next(e);
  }
});

movieRouter.get('/search', validate(searchMoviesPageValidator), async (req, res, next) => {
  const query = req.query;

  const page = query.page as string;
  const magnet = query.magnet as MagnetType;
  const type = query.type as MovieType | undefined;
  const keyword = query.keyword as string;

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
  const starId = req.params.id as string;
  const type = req.query.type as MovieType | undefined;

  try {
    const starInfo = await getStarInfo(starId, type);

    res.json(starInfo);
  } catch (e) {
    // 格式化一下错误
    next(e instanceof Error && e.message.includes('404') ? new createError.NotFound() : e);
  }
});

const magnetRouter = Router();

magnetRouter.get('/:movieId', validate(magnetsValidator), async (req, res, next) => {
  const movieId = req.params.movieId as string;
  const gid = req.query.gid as string;
  const uc = req.query.uc as string;
  const sortBy = req.query.sortBy as SortBy | undefined;
  const sortOrder = req.query.sortOrder as SortOrder | undefined;

  try {
    const magnets = await getMovieMagnets({ movieId, gid, uc, sortBy, sortOrder });

    res.json(magnets);
  } catch (e) {
    next(e);
  }
});

const router = Router();

router.use('/movies', movieRouter);
router.use('/stars', starRouter);
router.use('/magnets', magnetRouter);

export default router;
