import type { SearchState } from './types';
import { dateTimestamp, nextDay } from './dates';

function boundedInteger(value: string | null, fallback: number, max: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const number = Number(value);
  return number >= 1 && number <= max ? number : fallback;
}

export function parseSearchParams(params: URLSearchParams, today = new Date()): SearchState {
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const checkInValue = params.get('checkIn') ?? '';
  const checkIn = dateTimestamp(checkInValue) !== null && checkInValue < '9999-12-31' ? checkInValue : localToday;
  const checkOutValue = params.get('checkOut') ?? '';
  const checkOut = dateTimestamp(checkOutValue) !== null && checkOutValue > checkIn ? checkOutValue : nextDay(checkIn);
  const children = (params.get('children') ?? '').split(',')
    .filter(age => /^\d+$/.test(age) && Number(age) <= 17).slice(0, 10).map(Number);
  return {
    destination: params.get('destination')?.trim().slice(0, 100) || 'moscow',
    checkIn, checkOut,
    rooms: boundedInteger(params.get('rooms'), 1, 9),
    adults: boundedInteger(params.get('adults'), 2, 30),
    children,
    apartmentsOnly: params.get('apartmentsOnly') === 'true',
    tripType: params.get('tripType') === 'business' ? 'business' : 'leisure',
  };
}

export function serializeSearchState(state: SearchState): URLSearchParams {
  return new URLSearchParams({
    destination: state.destination, checkIn: state.checkIn, checkOut: state.checkOut,
    rooms: String(state.rooms), adults: String(state.adults), children: state.children.join(','),
    apartmentsOnly: String(state.apartmentsOnly), tripType: state.tripType,
  });
}
