/** Shared JSON contracts. Catalog values are owned by the mock server. */
export type TripType = 'leisure' | 'business';
export interface SearchState {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  /** Ages in years, from 0 through 17. */
  children: number[];
  apartmentsOnly: boolean;
  tripType: TripType;
}
export type HotelType = 'hotel' | 'apartment' | 'guesthouse' | 'hostel';
export type MealPlan = 'none' | 'breakfast' | 'half-board' | 'full-board';
export type Amenity = 'wifi' | 'parking' | 'pool' | 'spa' | 'fitness' | 'kitchen' | 'pets' | 'air-conditioning';
export interface Destination { id: string; name: string; country: string; }
export interface HotelRate {
  id: string;
  roomName: string;
  bedType: 'double' | 'twin' | 'bunk';
  /** RUB per room per night, including demo taxes. */
  nightlyPrice: number;
  originalNightlyPrice?: number;
  meal: MealPlan;
  freeCancellation: boolean;
  payment: 'now' | 'at-hotel';
  availableRooms: number;
  maxGuests: number;
}
export interface HotelReview { id: string; author: string; date: string; rating: number; text: string; }
export interface Hotel {
  id: string;
  slug: string;
  name: string;
  destinationId: string;
  type: HotelType;
  stars: number;
  rating: number;
  reviewCount: number;
  popularity: number;
  address: string;
  distanceFromCenter: number;
  coordinates: { lat: number; lng: number };
  images: string[];
  description: string;
  amenities: Amenity[];
  checkInTime: string;
  checkOutTime: string;
  rates: HotelRate[];
  reviews: HotelReview[];
}
export interface HotelFilters {
  /** Total stay price in RUB, including all rooms. */
  minPrice?: number;
  maxPrice?: number;
  types?: HotelType[];
  minRating?: number;
  stars?: number[];
  meals?: MealPlan[];
  freeCancellation?: boolean;
  amenities?: Amenity[];
  maxDistance?: number;
}
export type SortMode = 'popular' | 'rating' | 'price-asc' | 'price-desc';
export interface TransferQuery {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  returnDate?: string;
}
export interface TransferOption {
  id: string;
  category: string;
  vehicle: string;
  passengers: number;
  luggage: number;
  waitingMinutes: number;
  price: number;
  amenities: string[];
}
export interface HotelSearchResponse { hotels: Hotel[]; total: number; search: SearchState; }
export interface HotelResponse { hotel: Hotel; }
export interface DestinationsResponse { destinations: Destination[]; }
export interface TransferSearchResponse { transfers: TransferOption[]; total: number; query: TransferQuery; }
export interface ApiErrorResponse { error: { code: string; message: string }; }
