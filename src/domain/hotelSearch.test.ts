import { describe, expect, it } from 'vitest';
import { filterAndSortHotels } from './hotelSearch';
import { testHotel, testRate, testSearch } from '../test/domainFixtures';

describe('hotel search', () => {
  it('combines all hotel filters using a single eligible rate', () => {
    const good = testHotel();
    const bad = testHotel({ id: 'bad', rates: [{ ...testRate, nightlyPrice: 1000, meal: 'none' }, { ...testRate, nightlyPrice: 5000 }] });
    expect(filterAndSortHotels([bad, good], testSearch, { minPrice: 10000, maxPrice: 20000, types: ['hotel'], minRating: 8, stars: [4], meals: ['breakfast'], freeCancellation: true, amenities: ['wifi', 'parking'], maxDistance: 2 }, 'popular').map(h => h.id)).toEqual(['one']);
  });
  it('excludes wrong destinations, property types, and unavailable capacity', () => {
    const hotels = [testHotel(), testHotel({ id: 'other-city', destinationId: 'sochi' }), testHotel({ id: 'apartment', type: 'apartment' }), testHotel({ id: 'sold', rates: [{ ...testRate, availableRooms: 1 }] }), testHotel({ id: 'small', rates: [{ ...testRate, maxGuests: 1 }] })];
    expect(filterAndSortHotels(hotels, { ...testSearch, adults: 4, children: [8], apartmentsOnly: true }, {}, 'popular').map(h => h.id)).toEqual([]);
    expect(filterAndSortHotels(hotels, { ...testSearch, apartmentsOnly: true }, {}, 'popular').map(h => h.id)).toEqual(['apartment']);
  });
  it('sorts by price, rating and popularity stably without mutating input', () => {
    const hotels = [testHotel({ id: 'a', popularity: 1, rating: 8 }), testHotel({ id: 'b', popularity: 3, rating: 9, rates: [{ ...testRate, nightlyPrice: 2000 }] }), testHotel({ id: 'c', popularity: 3, rating: 9, rates: [{ ...testRate, nightlyPrice: 2000 }] })];
    for (const sort of ['popular', 'rating', 'price-asc'] as const) expect(filterAndSortHotels(hotels, testSearch, {}, sort).map(h => h.id)).toEqual(['b', 'c', 'a']);
    expect(filterAndSortHotels(hotels, testSearch, {}, 'price-desc').map(h => h.id)).toEqual(['a', 'b', 'c']);
    expect(hotels.map(h => h.id)).toEqual(['a', 'b', 'c']);
  });
  it('uses the cheapest rate matching meal and cancellation for price ordering', () => {
    const expensiveBreakfast = testHotel({ id: 'expensive', rates: [{ ...testRate, nightlyPrice: 500, meal: 'none' }, { ...testRate, nightlyPrice: 4000 }] });
    expect(filterAndSortHotels([expensiveBreakfast, testHotel()], testSearch, { meals: ['breakfast'] }, 'price-asc').map(h => h.id)).toEqual(['one', 'expensive']);
  });
  it('treats empty selections as unrestricted and excludes missing amenities', () => {
    expect(filterAndSortHotels([testHotel()], testSearch, { types: [], stars: [], meals: [] }, 'popular')).toHaveLength(1);
    expect(filterAndSortHotels([testHotel()], testSearch, { amenities: ['pool'] }, 'popular')).toEqual([]);
  });
});
