import { describe, expect, it } from 'vitest';
import { calculateStayPrice } from './pricing';
import { testRate, testSearch } from '../test/domainFixtures';

describe('stay pricing', () => {
  it('multiplies nightly RUB price by calendar nights and rooms deterministically', () => {
    expect(calculateStayPrice(testRate, testSearch)).toBe(15000);
    expect(calculateStayPrice(testRate, testSearch)).toBe(15000);
  });
  it('counts calendar nights across a daylight saving transition', () => {
    expect(calculateStayPrice(testRate, { ...testSearch, checkIn: '2026-03-28', checkOut: '2026-03-30', rooms: 1 })).toBe(5000);
  });
  it('uses a safe one-night, one-room minimum for reversed or invalid dates', () => {
    expect(calculateStayPrice(testRate, { ...testSearch, checkOut: 'bad', rooms: 0 })).toBe(2500);
  });
});
