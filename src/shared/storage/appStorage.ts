import type { SearchState } from '../../domain/types';
import { parseSearchParams, serializeSearchState } from '../../domain/searchParams';

export const APP_STORAGE_KEY = 'ostrovok-demo';
interface StoredState { version: 1; favorites: string[]; lastSearch: SearchState | null; }
const emptyState = (): StoredState => ({ version: 1, favorites: [], lastSearch: null });

function favoriteIds(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))] : [];
}
function searchState(value: unknown): SearchState | null {
  if (!value || typeof value !== 'object') return null;
  const state = value as Partial<SearchState>;
  if (typeof state.destination !== 'string' || typeof state.checkIn !== 'string' || typeof state.checkOut !== 'string'
    || typeof state.adults !== 'number' || typeof state.rooms !== 'number' || !Array.isArray(state.children)
    || !state.children.every(age => typeof age === 'number') || typeof state.apartmentsOnly !== 'boolean'
    || (state.tripType !== 'leisure' && state.tripType !== 'business')) return null;
  return parseSearchParams(serializeSearchState(state as SearchState));
}
function write(state: StoredState) {
  try { globalThis.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state)); } catch { /* Private mode or quota: persistence is optional. */ }
}
function read(): { state: StoredState; writable: boolean } {
  try {
    const raw: unknown = JSON.parse(globalThis.localStorage.getItem(APP_STORAGE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { state: emptyState(), writable: true };
    const record = raw as Record<string, unknown>;
    if (record.version !== 0 && record.version !== 1) return { state: emptyState(), writable: false };
    const state: StoredState = { version: 1, favorites: favoriteIds(record.version === 0 ? record.favoriteIds : record.favorites), lastSearch: searchState(record.version === 0 ? record.search : record.lastSearch) };
    if (record.version === 0) write(state);
    return { state, writable: true };
  } catch { return { state: emptyState(), writable: true }; }
}
export const appStorage = {
  getFavorites(): string[] { return read().state.favorites; },
  setFavorites(ids: string[]) {
    const { state, writable } = read();
    if (writable) write({ ...state, favorites: favoriteIds(ids) });
  },
  getLastSearch(): SearchState | null { return read().state.lastSearch; },
  setLastSearch(lastSearch: SearchState) {
    const { state, writable } = read();
    if (writable) write({ ...state, lastSearch: searchState(lastSearch) });
  },
};
