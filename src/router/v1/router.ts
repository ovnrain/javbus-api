import { Router } from 'express';
import movies from './routes/movies';
import stars from './routes/stars';

const router = Router();

router.use('/movies', movies);
router.use('/stars', stars);

export default router;
