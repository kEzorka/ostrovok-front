import { describe, expect, it } from 'vitest';
import { parseSearchParams, serializeSearchState } from './searchParams';
import type { SearchState } from './types';

const today = new Date('2026-10-27T12:00:00Z');
const state: SearchState = { destination: 'saint-petersburg', checkIn: '2026-11-02', checkOut: '2026-11-05', adults: 3, rooms: 2, children: [0, 8], apartmentsOnly: true, tripType: 'business' };

describe('search URL state', () => {
  it('round trips all booking fields and omits unknown parameters', () => {
    const params = serializeSearchState(state);
    params.set('tracking', 'ignored');
    expect(parseSearchParams(params, today)).toEqual(state);
    expect(serializeSearchState(parseSearchParams(params, today)).has('tracking')).toBe(false);
  });
  it('defaults malformed guests, rooms, flags and dates safely', () => {
    expect(parseSearchParams(new URLSearchParams('adults=no&rooms=-2&children=5,no,22&checkIn=2026-02-30&checkOut=no&apartmentsOnly=garbage&tripType=no'), today)).toEqual({ destination: 'moscow', checkIn: '2026-10-27', checkOut: '2026-10-28', adults: 2, rooms: 1, children: [5], apartmentsOnly: false, tripType: 'leisure' });
  });
  it.each(['2026-11-01', '2026-11-02'])('normalizes checkout %s before or on checkin to one night', (checkOut) => {
    expect(parseSearchParams(new URLSearchParams({ checkIn: '2026-11-02', checkOut }), today)).toMatchObject({ checkIn: '2026-11-02', checkOut: '2026-11-03' });
  });
  it('bounds integer guests and rooms and rejects decimals', () => {
    expect(parseSearchParams(new URLSearchParams('adults=999&rooms=100&children=0,17,18,-1,2.5'), today)).toMatchObject({ adults: 2, rooms: 1, children: [0, 17] });
    expect(parseSearchParams(new URLSearchParams('adults=2.5&rooms=2.5'), today)).toMatchObject({ adults: 2, rooms: 1 });
  });
  it('keeps historical valid dates reproducible and handles year boundaries', () => {
    expect(parseSearchParams(new URLSearchParams('checkIn=2025-12-31&checkOut=2025-12-30'), today)).toMatchObject({ checkIn: '2025-12-31', checkOut: '2026-01-01' });
  });
});
