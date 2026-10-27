import type { HotelRate, SearchState } from './types';
import { dateTimestamp, DAY_MS } from './dates';

export function calculateStayPrice(rate: HotelRate, state: SearchState): number {
  const start = dateTimestamp(state.checkIn);
  const end = dateTimestamp(state.checkOut);
  const nights = start !== null && end !== null ? Math.max(1, (end - start) / DAY_MS) : 1;
  const rooms = Number.isInteger(state.rooms) && state.rooms > 0 ? state.rooms : 1;
  return rate.nightlyPrice * nights * rooms;
}
