import { Router } from 'express';
import createError from 'http-errors';
import { typeValidator, validate } from '../validators.js';
import { getStarInfo } from '../javbusParser.js';
import type { MovieType } from '../types.js';

const router = Router();

router.get('/:id', validate([typeValidator]), async (req, res, next) => {
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

export default router;
