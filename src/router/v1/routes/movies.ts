import { Router } from 'express';
import { getMovieDetail, getMoviesByPage } from '../javbusParser';
import { isValidMoviesQuery } from '../utils';

const router = Router();

router.get('/', async (req, res, next) => {
  if (!isValidMoviesQuery(req.query)) {
    return res.status(400).json({ error: 'Invalid Query' });
  }

  const page = req.query.page;

  try {
    const { movies } = await getMoviesByPage(page);

    res.json({ page: parseInt(page, 10), result: movies });
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
    next(e);
  }
});

export default router;
