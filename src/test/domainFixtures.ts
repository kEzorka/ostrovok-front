import type { Hotel, HotelRate, SearchState } from '../domain/types';

export const testSearch: SearchState = { destination: 'moscow', checkIn: '2026-10-31', checkOut: '2026-11-03', rooms: 2, adults: 2, children: [], apartmentsOnly: false, tripType: 'leisure' };
export const testRate: HotelRate = { id: 'rate-1', roomName: 'Standard', bedType: 'double', nightlyPrice: 2500, meal: 'breakfast', freeCancellation: true, payment: 'at-hotel', availableRooms: 3, maxGuests: 2 };
export function testHotel(overrides: Partial<Hotel> = {}): Hotel {
  return { id: 'one', slug: 'one', name: 'One', destinationId: 'moscow', type: 'hotel', stars: 4, rating: 9, reviewCount: 20, popularity: 10, address: 'Demo address', distanceFromCenter: 1, coordinates: { lat: 55.75, lng: 37.62 }, images: [], description: 'Demo hotel', amenities: ['wifi', 'parking'], checkInTime: '14:00', checkOutTime: '12:00', rates: [testRate], reviews: [], ...overrides };
}
