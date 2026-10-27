import express from 'express';

export function createMockApi() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  return app;
}
