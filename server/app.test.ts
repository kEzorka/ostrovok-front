// @vitest-environment node
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createMockApi } from './app';

describe('mock API', () => {
  // A missing or renamed health route must fail the server's public smoke contract.
  it('returns the API health status', async () => {
    const response = await request(createMockApi()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
