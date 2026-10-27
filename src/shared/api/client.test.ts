// @vitest-environment node
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMockApi } from '../../../server/app';
import { createApiClient } from './client';
import { testSearch } from '../../test/domainFixtures';
import type { TransferQuery } from '../../domain/types';

let server: Server;
let client: ReturnType<typeof createApiClient>;
const transferQuery: TransferQuery = { from: 'Шереметьево', to: 'Москва', date: '2026-11-02', time: '12:30', passengers: 2 };
beforeAll(async () => {
  server = createMockApi().listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected local TCP address');
  client = createApiClient(`http://127.0.0.1:${address.port}/api`);
});
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });

describe('typed API boundary with the real mock server', () => {
  it('returns at least twelve diverse Moscow hotels with usable stable rates', async () => {
    const result = await client.searchHotels({ ...testSearch, rooms: 1 });
    expect(result.total).toBeGreaterThanOrEqual(12);
    expect(result.hotels).toHaveLength(result.total);
    expect(new Set(result.hotels.map(h => h.type)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(result.hotels.map(h => h.stars)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(result.hotels.flatMap(h => h.rates.map(r => r.meal))).size).toBe(4);
    expect(new Set(result.hotels.flatMap(h => h.rates.map(r => r.freeCancellation))).size).toBe(2);
    const rateIds = result.hotels.flatMap(h => h.rates.map(r => r.id));
    expect(new Set(rateIds).size).toBe(rateIds.length);
    expect(result.hotels.every(h => h.images.length >= 1 && h.images.every(image => image.startsWith('/api/assets/hotels/') && image.endsWith('.webp')))).toBe(true);
    expect(result.hotels.every(h => h.rates.every(rate => rate.nightlyPrice > 0 && rate.maxGuests > 0))).toBe(true);
  });
  it('fetches an individual hotel by slug with the same JSON data as search', async () => {
    const result = await client.searchHotels(testSearch);
    expect(result.hotels.length).toBeGreaterThan(0);
    const detail = await client.getHotel(result.hotels[0].slug);
    expect(detail.hotel).toEqual(result.hotels[0]);
  });
  it('normalizes malformed search values and scopes apartments and destinations', async () => {
    const result = await client.searchHotels({ ...testSearch, rooms: -1, adults: 0, checkOut: '2026-01-01', apartmentsOnly: true });
    expect(result.search).toMatchObject({ rooms: 1, adults: 2, checkOut: '2026-11-01' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.hotels.every(h => h.type === 'apartment')).toBe(true);
    expect((await client.searchHotels({ ...testSearch, destination: 'unknown' })).hotels).toEqual([]);
  });
  it('surfaces a typed not-found error and safely encodes path input', async () => {
    await expect(client.getHotel('missing/slash?x=1')).rejects.toMatchObject({ status: 404, code: 'HOTEL_NOT_FOUND' });
  });
  it('serves six transfers and filters out insufficient passenger capacity', async () => {
    const result = await client.listTransfers(transferQuery);
    expect(result.total).toBe(6);
    expect(result.query).toEqual(transferQuery);
    const groups = await client.listTransfers({ ...transferQuery, passengers: 7 });
    expect(groups.total).toBeGreaterThan(0);
    expect(groups.total).toBeLessThan(6);
    expect(groups.transfers.every(option => option.passengers >= 7)).toBe(true);
  });
  it('returns Russian destination autocomplete through the API', async () => {
    expect((await client.searchDestinations('МОС')).destinations).toEqual([{ id: 'moscow', name: 'Москва', country: 'Россия' }]);
    expect((await client.searchDestinations('no-such-city')).destinations).toEqual([]);
  });
  it('serves project-owned WebP image bytes at the returned catalog URL', async () => {
    const result = await client.searchHotels(testSearch);
    expect(result.hotels.length).toBeGreaterThan(0);
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Expected TCP address');
    const response = await fetch(`http://127.0.0.1:${address.port}${result.hotels[0].images[0]}`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('image/webp');
    const data = Buffer.from(await response.arrayBuffer());
    expect(data.toString('ascii', 0, 4)).toBe('RIFF');
    expect(data.toString('ascii', 8, 12)).toBe('WEBP');
  });
});
