import { Router } from 'express';
import type { Request } from 'express';
import type { DestinationsResponse } from '../../src/domain/types';
import { destinations } from '../fixtures/destinations';

/** Use the original URL so duplicate/nested query input cannot become objects. */
export function requestParams(request: Request): URLSearchParams {
  return new URL(request.originalUrl, 'http://localhost').searchParams;
}
export const searchRoutes = Router();
searchRoutes.get('/destinations', (request, response) => {
  const query = (requestParams(request).get('q') ?? '').trim().toLocaleLowerCase('ru');
  const body: DestinationsResponse = { destinations: destinations.filter(destination => `${destination.name} ${destination.id}`.toLocaleLowerCase('ru').includes(query)) };
  response.json(body);
});
