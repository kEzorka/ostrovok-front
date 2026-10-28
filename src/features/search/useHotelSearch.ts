import { useEffect, useMemo, useState } from 'react';
import { parseSearchParams } from '../../domain/searchParams';
import { filterAndSortHotels } from '../../domain/hotelSearch';
import type { Hotel, HotelFilters, SearchState, SortMode } from '../../domain/types';
import { apiClient } from '../../shared/api/client';

export function useHotelSearch(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  const state = useMemo(() => parseSearchParams(new URLSearchParams(query)), [query]);
  const [result, setResult] = useState<{ state: SearchState; hotels: Hotel[]; status: 'ready' | 'error' } | null>(null);
  const [filters, setFilters] = useState<HotelFilters>({});
  const [sort, setSort] = useState<SortMode>('popular');
  useEffect(() => {
    let active = true;
    apiClient.searchHotels(state).then(response => { if (active) setResult({ state, hotels: response.hotels, status: 'ready' }); }).catch(() => { if (active) setResult({ state, hotels: [], status: 'error' }); });
    return () => { active = false; };
  }, [state]);
  const current = result?.state === state ? result : null;
  return { state, hotels: filterAndSortHotels(current?.hotels ?? [], state, filters, sort), filters, setFilters, sort, setSort, status: current?.status ?? 'loading' };
}
