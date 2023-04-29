import { Router } from 'express';
import movies from './routes/movies.mjs';
import stars from './routes/stars.mjs';

const router = Router();

router.use('/movies', movies);
router.use('/stars', stars);

export default router;
