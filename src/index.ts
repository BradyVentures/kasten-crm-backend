import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(cors({
  origin: env.corsOrigin.split(',').map(s => s.trim()),
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Bauelemente Kasten CRM Backend running on port ${env.port}`);
});
