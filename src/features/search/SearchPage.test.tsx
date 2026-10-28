import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../../app/routes';
import { testHotel, testRate } from '../../test/domainFixtures';
import { testSearch } from '../../test/domainFixtures';
import { LocalMap } from './LocalMap';

const hotels = [
  testHotel({ id: 'one', name: 'Hotel One', popularity: 20, rates: [{ ...testRate, nightlyPrice: 4000 }] }),
  testHotel({ id: 'two', slug: 'two', name: 'Hotel Two', type: 'apartment', popularity: 10, amenities: ['wifi'], rates: [{ ...testRate, nightlyPrice: 2000, meal: 'none', freeCancellation: false }] }),
];
const query = '?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=1&adults=2';
const destinations = [{ id: 'moscow', name: 'Москва', country: 'Россия' }, { id: 'saint-petersburg', name: 'Санкт-Петербург', country: 'Россия' }, { id: 'kazan', name: 'Казань', country: 'Россия' }, { id: 'sochi', name: 'Сочи', country: 'Россия' }];
function openSearch() {
  const router = createMemoryRouter(appRoutes, { initialEntries: [`/search${query}`] });
  const view = render(<RouterProvider router={router} />);
  return { ...view, router };
}
beforeEach(() => {
  const entries = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => entries.set(key, value) });
  vi.spyOn(globalThis, 'fetch').mockImplementation(async input => new Response(JSON.stringify(String(input).includes('/destinations') ? { destinations } : { hotels, total: 2 }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('search results', () => {
  it('keeps coordinate positions stable when results are filtered or reordered', () => {
    const west = testHotel({ id: 'west', name: 'West', coordinates: { lat: 55.74, lng: 37.60 } });
    const east = testHotel({ id: 'east', name: 'East', coordinates: { lat: 55.76, lng: 37.64 } });
    const catalog = [west, east];
    const view = render(<LocalMap hotels={catalog} catalog={catalog} state={testSearch} filters={{}} selected={null} onSelect={() => {}} />);
    const position = (id: string) => { const point = view.container.querySelector(`[data-map-point="${id}"]`) as HTMLElement | null; expect(point).not.toBeNull(); return { left: point?.style.left ?? '', top: point?.style.top ?? '' }; };
    const westPosition = position('west'), eastPosition = position('east');
    expect(parseFloat(westPosition.left)).toBeLessThan(parseFloat(eastPosition.left));
    expect(parseFloat(eastPosition.top)).toBeLessThan(parseFloat(westPosition.top));
    view.rerender(<LocalMap hotels={[east]} catalog={catalog} state={testSearch} filters={{}} selected={null} onSelect={() => {}} />);
    expect(position('east')).toEqual(eastPosition);
    view.rerender(<LocalMap hotels={[east, west]} catalog={catalog} state={testSearch} filters={{}} selected={null} onSelect={() => {}} />);
    expect(position('west')).toEqual(westPosition);
  });
  it('shows URL results and sorts by stay price', async () => {
    openSearch();
    expect(await screen.findByRole('link', { name: /Hotel One/ })).toHaveAttribute('href', `/hotel/one${query}`);
    const list = screen.getByRole('list', { name: 'Результаты поиска' });
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Hotel One');
    await userEvent.selectOptions(screen.getByLabelText('Сортировка'), 'price-asc');
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Hotel Two');
  });
  it('composes filters, shows live counts, and resets an empty result', async () => {
    openSearch();
    await screen.findByRole('link', { name: 'Hotel One' });
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Апартаменты'));
    expect(screen.getByText('Найдено: 1')).toBeVisible();
    await user.click(screen.getByLabelText('Бесплатная отмена'));
    expect(screen.getByText('Ничего не найдено')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(screen.getByText('Найдено: 2')).toBeVisible();
  });
  it('persists favorites across remounts', async () => {
    const view = openSearch();
    await screen.findByRole('link', { name: 'Hotel One' });
    await userEvent.click(screen.getByRole('button', { name: 'Добавить Hotel One в избранное' }));
    view.unmount();
    openSearch();
    expect(await screen.findByRole('button', { name: 'Убрать Hotel One из избранного' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('synchronizes map markers and cards and selects a category', async () => {
    openSearch();
    await screen.findByRole('link', { name: 'Hotel One' });
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'На карте' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Показать Hotel Two на карте' })[0]);
    expect(screen.getByRole('link', { name: /Hotel Two/ })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Апартаменты' }));
    expect(screen.getByRole('button', { name: 'Апартаменты' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Показать Hotel One на карте' })).not.toBeInTheDocument();
  });
  it('prices markers using available rates that satisfy the active filters', async () => {
    const hotel = testHotel({ name: 'Hotel One', rates: [
      { ...testRate, id: 'unavailable', nightlyPrice: 100, availableRooms: 0 },
      { ...testRate, id: 'capacity', nightlyPrice: 200, maxGuests: 1 },
      { ...testRate, id: 'no-cancel', nightlyPrice: 300, freeCancellation: false },
      { ...testRate, id: 'no-breakfast', nightlyPrice: 400, meal: 'none' },
      { ...testRate, id: 'cheap', nightlyPrice: 500 },
      { ...testRate, id: 'matching', nightlyPrice: 5000 },
    ] });
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ hotels: [hotel], total: 1 }), { status: 200 }));
    openSearch();
    await screen.findByRole('link', { name: 'Hotel One' });
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Бесплатная отмена'));
    await user.click(screen.getByLabelText('Завтрак включён'));
    await user.type(screen.getByLabelText('Цена от'), '12000');
    await user.type(screen.getByLabelText('Цена до'), '18000');
    await user.click(screen.getAllByRole('button', { name: 'На карте' })[0]);
    const marker = screen.getAllByRole('button', { name: 'Показать Hotel One на карте' })[0];
    expect(marker.textContent?.replace(/\s/g, '')).toContain('15000₽');
    await user.click(marker);
    expect(screen.getByRole('article').textContent?.replace(/\s/g, '')).toContain('15000₽');
  });
  it('shows remaining cards when filters remove the selected map hotel', async () => {
    openSearch();
    await screen.findByRole('link', { name: 'Hotel One' });
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'На карте' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Показать Hotel Two на карте' })[0]);
    await user.click(screen.getByLabelText('Бесплатная отмена'));
    expect(screen.getByRole('link', { name: /Hotel One/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Показать Hotel Two на карте' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));
    expect(screen.getByRole('link', { name: /Hotel One/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Hotel Two/ })).toBeVisible();
  });
  it.each([['saint-petersburg', 'Санкт-Петербург'], ['kazan', 'Казань'], ['sochi', 'Сочи']])('shows the destination name from the API for %s', async (id, name) => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [`/search${query.replace('moscow', id)}`] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole('heading', { name: `${name}: варианты размещения` })).toBeVisible();
  });
  it('does not restore an old marker selection after navigating away and back', async () => {
    const { router } = openSearch();
    await screen.findByRole('link', { name: 'Hotel One' });
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'На карте' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Показать Hotel Two на карте' })[0]);
    await act(async () => { await router.navigate(`/search${query.replace('2026-11-03', '2026-11-04')}`); });
    await screen.findByRole('link', { name: 'Hotel One' });
    await act(async () => { await router.navigate(`/search${query}`); });
    expect(await screen.findByRole('link', { name: /Hotel One/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Hotel Two/ })).toBeVisible();
  });
  it('shows loading instead of previous results while a changed URL request is pending', async () => {
    let resolveNext!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation(input => String(input).includes('destination=other')
      ? new Promise<Response>(resolve => { resolveNext = resolve; })
      : Promise.resolve(new Response(JSON.stringify({ hotels, total: 2 }), { status: 200 })));
    const { router } = openSearch();
    await screen.findByRole('link', { name: 'Hotel One' });
    await act(async () => { await router.navigate(`/search${query.replace('moscow', 'other')}`); });
    expect(screen.getByText('Загружаем варианты…')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Hotel One' })).not.toBeInTheDocument();
    expect(screen.queryByText('Ничего не найдено')).not.toBeInTheDocument();
    await act(async () => { resolveNext(new Response(JSON.stringify({ hotels: [testHotel({ id: 'other', name: 'Other Hotel', destinationId: 'other' })], total: 1 }), { status: 200 })); });
    expect(await screen.findByRole('link', { name: 'Other Hotel' })).toBeVisible();
  });
});
