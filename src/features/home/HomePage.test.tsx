import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../../app/routes';
import { APP_STORAGE_KEY, appStorage } from '../../shared/storage/appStorage';

describe('home search', () => {
  beforeEach(() => {
    const entries = new Map<string, string>();
    const storage: Storage = { get length() { return entries.size; }, clear: () => entries.clear(), getItem: key => entries.get(key) ?? null, setItem: (key, value) => { entries.set(key, value); }, removeItem: key => { entries.delete(key); }, key: index => [...entries.keys()][index] ?? null };
    vi.stubGlobal('localStorage', storage);
  });
  afterEach(() => vi.unstubAllGlobals());
  it('persists a submitted hotel search and restores it when home remounts', async () => {
    const user = userEvent.setup();
    appStorage.setFavorites(['hotel-one']);
    const router = createMemoryRouter(appRoutes);
    const view = render(<RouterProvider router={router} />);
    const checkIn = screen.getByLabelText('Заезд');
    const checkOut = screen.getByLabelText('Выезд');
    await user.clear(checkIn); await user.type(checkIn, '2030-05-10');
    await user.clear(checkOut); await user.type(checkOut, '2030-05-13');
    await user.click(screen.getByRole('button', { name: /гост/ }));
    await user.click(screen.getByRole('button', { name: 'Добавить взрослого' }));
    await user.click(screen.getByLabelText('Только апартаменты'));
    await user.click(screen.getByLabelText('Командировка'));
    await user.click(screen.getByRole('button', { name: 'Найти' }));
    expect(router.state.location.pathname).toBe('/search');
    expect(router.state.location.search).toBe('?destination=moscow&checkIn=2030-05-10&checkOut=2030-05-13&rooms=1&adults=3&children=&apartmentsOnly=true&tripType=business');
    expect(appStorage.getLastSearch()).toEqual({ destination: 'moscow', checkIn: '2030-05-10', checkOut: '2030-05-13', rooms: 1, adults: 3, children: [], apartmentsOnly: true, tripType: 'business' });
    expect(appStorage.getFavorites()).toEqual(['hotel-one']);
    view.unmount();
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    expect(screen.getByLabelText('Заезд')).toHaveValue('2030-05-10');
    expect(screen.getByLabelText('Выезд')).toHaveValue('2030-05-13');
    expect(screen.getByRole('button', { name: /3 гост/ })).toBeVisible();
    expect(screen.getByLabelText('Только апартаменты')).toBeChecked();
    expect(screen.getByLabelText('Командировка')).toBeChecked();
  });
  it('restores a previously stored search on initial mount', () => {
    appStorage.setLastSearch({ destination: 'moscow', checkIn: '2031-01-02', checkOut: '2031-01-04', rooms: 2, adults: 4, children: [7], apartmentsOnly: false, tripType: 'leisure' });
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    expect(screen.getByLabelText('Заезд')).toHaveValue('2031-01-02');
    expect(screen.getByLabelText('Выезд')).toHaveValue('2031-01-04');
    expect(screen.getByRole('button', { name: /5 гост/ })).toBeVisible();
  });
  it('uses the current default dates when stored search is invalid', () => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({ version: 1, favorites: [], lastSearch: { destination: 42 } }));
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    expect(screen.getByLabelText('Заезд')).toHaveValue(expected);
    expect(screen.getByRole('combobox', { name: 'Направление' })).toHaveValue('Москва, Россия');
    expect(screen.getByRole('button', { name: /2 гост/ })).toBeVisible();
  });
  it('opens transfer search when returning to edit a transfer', () => {
    render(<RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: ['/?tab=transfers'] })} />);
    expect(screen.getByLabelText('Откуда')).toBeVisible();
  });
  it('selects a destination using the keyboard', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ destinations: [{ id: 'saint-petersburg', name: 'Санкт-Петербург', country: 'Россия' }] }), { status: 200 }));
    const user = userEvent.setup();
    const router = createMemoryRouter(appRoutes);
    render(<RouterProvider router={router} />);
    const destination = screen.getByRole('combobox', { name: 'Направление' });
    await user.clear(destination); await user.type(destination, 'Санкт');
    expect(await screen.findByRole('option', { name: 'Санкт-Петербург, Россия' })).toBeVisible();
    await user.keyboard('{Enter}');
    expect(destination).toHaveValue('Санкт-Петербург, Россия');
    await user.click(screen.getByRole('button', { name: 'Найти' }));
    expect(router.state.location.search).toContain('destination=saint-petersburg');
  });
  it('navigates with hotel search choices and rejects reversed dates', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(appRoutes);
    render(<RouterProvider router={router} />);
    const checkIn = screen.getByLabelText('Заезд');
    const checkOut = screen.getByLabelText('Выезд');
    await user.clear(checkIn); await user.type(checkIn, '2026-11-05');
    await user.clear(checkOut); await user.type(checkOut, '2026-11-04');
    await user.click(screen.getByRole('button', { name: 'Найти' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Дата выезда');
    await user.clear(checkOut); await user.type(checkOut, '2026-11-07');
    await user.click(screen.getByRole('button', { name: /гост/ }));
    await user.click(screen.getByRole('button', { name: 'Добавить взрослого' }));
    await user.click(screen.getByRole('button', { name: 'Добавить ребёнка' }));
    await user.selectOptions(screen.getByLabelText('Возраст ребёнка 1'), '8');
    await user.click(screen.getByRole('button', { name: 'Добавить номер' }));
    await user.click(screen.getByLabelText('Только апартаменты'));
    await user.click(screen.getByLabelText('Командировка'));
    await user.click(screen.getByRole('button', { name: 'Найти' }));
    expect(router.state.location.pathname).toBe('/search');
    expect(router.state.location.search).toBe('?destination=moscow&checkIn=2026-11-05&checkOut=2026-11-07&rooms=2&adults=3&children=8&apartmentsOnly=true&tripType=business');
  });

  it('offers transfers and navigates with round trip details', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(appRoutes);
    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole('button', { name: 'Трансферы' }));
    await user.type(screen.getByLabelText('Откуда'), 'Москва');
    await user.type(screen.getByLabelText('Куда'), 'Аэропорт');
    await user.click(screen.getByLabelText('Туда и обратно'));
    await user.type(screen.getByLabelText('Дата поездки'), '2026-11-05');
    await user.type(screen.getByLabelText('Дата обратно'), '2026-11-07');
    await user.selectOptions(screen.getByLabelText('Пассажиры'), '3');
    await user.click(screen.getByRole('button', { name: 'Найти' }));
    expect(router.state.location.pathname).toBe('/transfers');
    expect(router.state.location.search).toContain('from=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0');
    expect(router.state.location.search).toContain('passengers=3');
    expect(router.state.location.search).toContain('returnDate=2026-11-07');
  });

  it('presents benefits, app and subscription locally', async () => {
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    expect(screen.getByText(/приложени/i)).toBeVisible();
    expect(screen.getByRole('contentinfo')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Подписаться' }));
    expect(screen.getByRole('status')).toHaveTextContent(/демо/i);
  });
  it('uses ordinary buttons for switching search modes', async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    const transfer = screen.getByRole('button', { name: 'Трансферы' });
    await user.click(transfer);
    expect(transfer).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Откуда')).toBeVisible();
  });
});
