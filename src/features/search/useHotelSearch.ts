import { useEffect, useMemo, useState } from 'react';
import { parseSearchParams } from '../../domain/searchParams';
import { filterAndSortHotels } from '../../domain/hotelSearch';
import type { Hotel, HotelFilters, SortMode } from '../../domain/types';
import { apiClient } from '../../shared/api/client';

export function useHotelSearch(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  const state = useMemo(() => parseSearchParams(new URLSearchParams(query)), [query]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [filters, setFilters] = useState<HotelFilters>({});
  const [sort, setSort] = useState<SortMode>('popular');
  useEffect(() => {
    let active = true;
    apiClient.searchHotels(state).then(result => { if (active) { setHotels(result.hotels); setStatus('ready'); } }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [state]);
  return { state, hotels: filterAndSortHotels(hotels, state, filters, sort), filters, setFilters, sort, setSort, status };
}
