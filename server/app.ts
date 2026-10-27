import express from 'express';
import { fileURLToPath } from 'node:url';
import { searchRoutes } from './routes/search';
import { hotelRoutes } from './routes/hotels';
import { transferRoutes } from './routes/transfers';

export function createMockApi() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  app.use('/api/assets/hotels', express.static(fileURLToPath(new URL('../src/assets/hotels/', import.meta.url)), { index: false }));
  app.use('/api', searchRoutes, hotelRoutes, transferRoutes);
  return app;
}
