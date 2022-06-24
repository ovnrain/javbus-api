import 'dotenv/config';
import express from 'express';
import v1Router from './router/v1';

const PORT = parseInt(process.env.PORT || '', 10) || 3000;
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use('/api/v1', v1Router);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});
