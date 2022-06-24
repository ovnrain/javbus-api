import { Router } from 'express';

const router = Router();

router.get('/movies', (req, res) => {
  res.json([]);
});

export default router;
