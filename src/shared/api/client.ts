import type { DestinationsResponse, HotelResponse, HotelSearchResponse, SearchState, TransferQuery, TransferSearchResponse } from '../../domain/types';
import { serializeSearchState } from '../../domain/searchParams';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiClient(baseUrl = '/api') {
  async function get<T>(path: string): Promise<T> {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiError(response.status, body?.error?.code ?? 'HTTP_ERROR', body?.error?.message ?? `Ошибка запроса (${response.status})`);
    }
    return response.json() as Promise<T>;
  }
  return {
    searchHotels(query: SearchState): Promise<HotelSearchResponse> { return get(`/hotels?${serializeSearchState(query)}`); },
    getHotel(slug: string): Promise<HotelResponse> { return get(`/hotels/${encodeURIComponent(slug)}`); },
    listTransfers(query: TransferQuery): Promise<TransferSearchResponse> {
      const params = new URLSearchParams({ from: query.from, to: query.to, date: query.date, time: query.time, passengers: String(query.passengers) });
      if (query.returnDate) params.set('returnDate', query.returnDate);
      return get(`/transfers?${params}`);
    },
    searchDestinations(query = ''): Promise<DestinationsResponse> { return get(`/destinations?${new URLSearchParams({ q: query })}`); },
  };
}
export const apiClient = createApiClient();
