import { Router } from 'express';
import createError from 'http-errors';
import { getStarInfo } from '../javbusParser';

const router = Router();

router.get('/:id', async (req, res, next) => {
  const starId = req.params.id;

  try {
    const starInfo = await getStarInfo(starId);

    res.json(starInfo);
  } catch (e) {
    // 格式化一下错误
    next(e instanceof Error && e.message.includes('404') ? new createError.NotFound() : e);
  }
});

export default router;
