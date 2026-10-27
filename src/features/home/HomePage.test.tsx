import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../../app/routes';

describe('home search', () => {
  afterEach(() => vi.unstubAllGlobals());
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
    await user.click(screen.getByRole('tab', { name: 'Трансферы' }));
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
});
