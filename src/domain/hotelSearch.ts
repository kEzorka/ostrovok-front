import type { Hotel, HotelFilters, SearchState, SortMode } from './types';
import { calculateStayPrice } from './pricing';

export function filterAndSortHotels(hotels: Hotel[], state: SearchState, filters: HotelFilters, sort: SortMode): Hotel[] {
  const guestsPerRoom = Math.ceil((state.adults + state.children.length) / state.rooms);
  const matches = hotels.flatMap(hotel => {
    if (hotel.destinationId !== state.destination
      || (state.apartmentsOnly && hotel.type !== 'apartment')
      || (filters.types?.length && !filters.types.includes(hotel.type))
      || (filters.stars?.length && !filters.stars.includes(hotel.stars))
      || hotel.rating < (filters.minRating ?? 0)
      || hotel.distanceFromCenter > (filters.maxDistance ?? Infinity)
      || !((filters.amenities ?? []).every(amenity => hotel.amenities.includes(amenity)))) return [];
    const prices = hotel.rates.filter(rate => rate.availableRooms >= state.rooms && rate.maxGuests >= guestsPerRoom
      && (!filters.meals?.length || filters.meals.includes(rate.meal))
      && (!filters.freeCancellation || rate.freeCancellation))
      .map(rate => calculateStayPrice(rate, state))
      .filter(price => price >= (filters.minPrice ?? 0) && price <= (filters.maxPrice ?? Infinity));
    return prices.length ? [{ hotel, price: Math.min(...prices) }] : [];
  });
  return matches.sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating') return b.hotel.rating - a.hotel.rating;
    return b.hotel.popularity - a.hotel.popularity;
  }).map(result => result.hotel);
}
