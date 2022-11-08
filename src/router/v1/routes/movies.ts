import { Router } from 'express';
import createError from 'http-errors';
import {
  getMovieDetail,
  getMoviesByKeywordAndPage,
  getMoviesByPage,
  getMoviesByStarAndPage,
  getMoviesByTagAndPage,
} from '../javbusParser';
import type { MagnetType, Movie, MovieTag, MovieType, Pagination, StarInfo } from '../types';
import { moviesPageValidator, searchMoviesPageValidator, validate } from '../validators';

const router = Router();

router.get('/', validate(moviesPageValidator), async (req, res, next) => {
  const query = req.query;

  const page = query.page as string;
  const magnet = query.magnet as MagnetType;
  const type = query.type as MovieType | undefined;
  const starId = query.starId as string | undefined;
  const tagId = query.tagId as string | undefined;

  try {
    let response: { movies: Movie[]; pagination: Pagination; star?: StarInfo; tag?: MovieTag };

    if (starId) {
      const {
        movies,
        pagination,
        starInfo: star,
      } = await getMoviesByStarAndPage(starId, page, magnet, type);
      response = { movies, pagination, star };
    } else if (tagId) {
      const {
        movies,
        pagination,
        tagInfo: tag,
      } = await getMoviesByTagAndPage(tagId, page, magnet, type);
      response = { movies, pagination, tag };
    } else {
      const { movies, pagination } = await getMoviesByPage(page, magnet, type);
      response = { movies, pagination };
    }

    res.json(response);
  } catch (e) {
    next(e);
  }
});

router.get('/search', validate(searchMoviesPageValidator), async (req, res, next) => {
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
