import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testSearch } from '../../test/domainFixtures';
import { APP_STORAGE_KEY, appStorage } from './appStorage';

// Storage is the external boundary. Avoid Node's experimental localStorage shim.
const entries = new Map<string, string>();
const storage: Storage = {
  get length() { return entries.size; },
  clear: () => entries.clear(),
  getItem: key => entries.get(key) ?? null,
  setItem: (key, value) => { entries.set(key, value); },
  removeItem: key => { entries.delete(key); },
  key: index => [...entries.keys()][index] ?? null,
};
beforeEach(() => { vi.stubGlobal('localStorage', storage); storage.clear(); });
afterEach(() => vi.unstubAllGlobals());
describe('versioned application storage', () => {
  it('persists unique favorites alongside last search without losing either field', () => {
    appStorage.setLastSearch(testSearch);
    appStorage.setFavorites(['one', 'one', 'two']);
    expect(appStorage.getFavorites()).toEqual(['one', 'two']);
    expect(appStorage.getLastSearch()).toEqual(testSearch);
    expect(JSON.parse(storage.getItem(APP_STORAGE_KEY)!)).toMatchObject({ version: 1 });
  });
  it('recovers from corrupt JSON and invalid shapes', () => {
    for (const value of ['{bad', 'null', '[]', '{"version":1,"favorites":"bad","lastSearch":123}']) {
      storage.setItem(APP_STORAGE_KEY, value);
      expect(appStorage.getFavorites()).toEqual([]);
      expect(appStorage.getLastSearch()).toBeNull();
    }
    appStorage.setFavorites(['recovered']);
    expect(appStorage.getFavorites()).toEqual(['recovered']);
  });
  it('migrates version zero favoriteIds and search to version one', () => {
    storage.setItem(APP_STORAGE_KEY, JSON.stringify({ version: 0, favoriteIds: ['a', 'a', 'b'], search: testSearch }));
    expect(appStorage.getFavorites()).toEqual(['a', 'b']);
    expect(appStorage.getLastSearch()).toEqual(testSearch);
    expect(JSON.parse(storage.getItem(APP_STORAGE_KEY)!)).toEqual({ version: 1, favorites: ['a', 'b'], lastSearch: testSearch });
  });
  it('ignores unsupported future schemas without overwriting them', () => {
    const future = '{"version":2,"favorites":["future"]}';
    storage.setItem(APP_STORAGE_KEY, future);
    appStorage.setFavorites(['new']);
    expect(storage.getItem(APP_STORAGE_KEY)).toBe(future);
    expect(appStorage.getFavorites()).toEqual([]);
  });
  it('keeps the app usable when storage access is unavailable', () => {
    vi.spyOn(storage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => appStorage.setFavorites(['one'])).not.toThrow();
    expect(appStorage.getFavorites()).toEqual([]);
  });
});
