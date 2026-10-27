import { Router } from 'express';
import type { ApiErrorResponse, HotelResponse, HotelSearchResponse } from '../../src/domain/types';
import { filterAndSortHotels } from '../../src/domain/hotelSearch';
import { parseSearchParams } from '../../src/domain/searchParams';
import { hotels } from '../fixtures/hotels';
import { requestParams } from './search';

export const hotelRoutes = Router();
hotelRoutes.get('/hotels', (request, response) => {
  const search = parseSearchParams(requestParams(request));
  const results = filterAndSortHotels(hotels, search, {}, 'popular');
  const body: HotelSearchResponse = { hotels: results, total: results.length, search };
  response.json(body);
});
hotelRoutes.get('/hotels/:slug', (request, response) => {
  const hotel = hotels.find(candidate => candidate.slug === request.params.slug);
  if (!hotel) {
    const body: ApiErrorResponse = { error: { code: 'HOTEL_NOT_FOUND', message: 'Отель не найден' } };
    response.status(404).json(body);
    return;
  }
  const body: HotelResponse = { hotel };
  response.json(body);
});
