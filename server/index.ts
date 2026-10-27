import { createMockApi } from './app';

const port = Number(process.env.PORT ?? 3001);
const server = createMockApi().listen(port, '127.0.0.1', () => {
  console.log(`Mock API listening at http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close());
}
