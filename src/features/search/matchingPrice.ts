import { calculateStayPrice } from '../../domain/pricing';
import type { Hotel, HotelFilters, SearchState } from '../../domain/types';

export function matchingPrice(hotel: Hotel, state: SearchState, filters: HotelFilters): number {
  const guests = Math.ceil((state.adults + state.children.length) / state.rooms);
  const prices = hotel.rates.filter(rate => rate.availableRooms >= state.rooms && rate.maxGuests >= guests
    && (!filters.meals?.length || filters.meals.includes(rate.meal))
    && (!filters.freeCancellation || rate.freeCancellation))
    .map(rate => calculateStayPrice(rate, state))
    .filter(price => price >= (filters.minPrice ?? 0) && price <= (filters.maxPrice ?? Infinity));
  return Math.min(...prices);
}
