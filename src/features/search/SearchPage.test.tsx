import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../../app/routes';
import { testHotel, testRate } from '../../test/domainFixtures';

const hotels = [
  testHotel({ id: 'one', name: 'Hotel One', popularity: 20, rates: [{ ...testRate, nightlyPrice: 4000 }] }),
  testHotel({ id: 'two', slug: 'two', name: 'Hotel Two', type: 'apartment', popularity: 10, amenities: ['wifi'], rates: [{ ...testRate, nightlyPrice: 2000, meal: 'none', freeCancellation: false }] }),
];
const query = '?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=1&adults=2';
function openSearch() {
  const router = createMemoryRouter(appRoutes, { initialEntries: [`/search${query}`] });
  const view = render(<RouterProvider router={router} />);
  return { ...view, router };
}
beforeEach(() => {
  const entries = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => entries.set(key, value) });
  vi.spyOn(globalThis, 'fetch').mockImplementation(async input => new Response(JSON.stringify(String(input).includes('/destinations') ? { destinations: [] } : { hotels, total: 2 }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('search results', () => {
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
    await screen.findByText('Hotel One');
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
    await screen.findByText('Hotel One');
    await userEvent.click(screen.getByRole('button', { name: 'Добавить Hotel One в избранное' }));
    view.unmount();
    openSearch();
    expect(await screen.findByRole('button', { name: 'Убрать Hotel One из избранного' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('synchronizes map markers and cards and selects a category', async () => {
    openSearch();
    await screen.findByText('Hotel One');
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'На карте' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Показать Hotel Two на карте' })[0]);
    expect(screen.getByRole('link', { name: /Hotel Two/ })).toBeVisible();
    await user.click(screen.getByRole('tab', { name: 'Апартаменты' }));
    expect(screen.getByRole('tab', { name: 'Апартаменты' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('button', { name: 'Показать Hotel One на карте' })).not.toBeInTheDocument();
  });
});
