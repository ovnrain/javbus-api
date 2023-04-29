import { Router } from 'express';
import movies from './routes/movies.js';
import stars from './routes/stars.js';

const router = Router();

router.use('/movies', movies);
router.use('/stars', stars);

export default router;
