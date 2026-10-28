import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../../app/routes';
import { testHotel, testRate } from '../../test/domainFixtures';

const query = '?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=2&adults=2';
const hotel = testHotel({ name: 'Hotel One', images: ['/one.webp', '/two.webp'], amenities: ['wifi', 'parking', 'pool', 'spa', 'fitness'], reviews: [{ id: 'review', author: 'Анна', date: '2026-10-01', rating: 9, text: 'Отличное место' }], rates: [
  { ...testRate, id: 'double', roomName: 'Double room' },
  { ...testRate, id: 'twin', roomName: 'Twin room', bedType: 'twin', meal: 'none', payment: 'now', freeCancellation: false, nightlyPrice: 3000 },
  { ...testRate, id: 'sold-out', roomName: 'Sold out', availableRooms: 1 },
] });
const similar = testHotel({ id: 'two', slug: 'two', name: 'Hotel Two' });
function open(path = `/hotel/one${query}`) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}
beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
    const url = String(input);
    if (url.includes('/hotels/missing')) return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }), { status: 404 });
    return new Response(JSON.stringify(url.includes('/hotels/one') ? { hotel } : { hotels: [hotel, similar], total: 2 }), { status: 200 });
  });
});
afterEach(() => vi.restoreAllMocks());

describe('hotel details', () => {
  it('shows metadata, search details, gallery navigation and the stay price with checkout query', async () => {
    open();
    expect(await screen.findByRole('heading', { name: 'Hotel One' })).toBeVisible();
    expect(screen.getByText('Demo address')).toBeVisible();
    expect(screen.getByText(/2026-10-31.*2026-11-03/)).toBeVisible();
    expect(screen.getByText(/2026-10-31.*2 гост/)).toBeVisible();
    const gallery = screen.getByRole('region', { name: 'Фотографии отеля' });
    expect(within(gallery).getByRole('img', { name: /Фото 1/ })).toHaveAttribute('src', '/one.webp');
    await userEvent.click(within(gallery).getByRole('button', { name: 'Следующее фото' }));
    expect(within(gallery).getByRole('img', { name: /Фото 2/ })).toHaveAttribute('src', '/two.webp');
    expect(screen.getAllByText(/15\s*000 ₽/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Выбрать Double room/ })).toHaveAttribute('href', `/checkout/double${query}`);
    expect(screen.queryByText('Sold out')).not.toBeInTheDocument();
  });
  it('combines bed, meal, payment and cancellation filters', async () => {
    open(); await screen.findByText('Double room');
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Кровать'), 'twin');
    await user.selectOptions(screen.getByLabelText('Питание'), 'none');
    await user.selectOptions(screen.getByLabelText('Оплата'), 'now');
    expect(screen.getByText('Twin room')).toBeVisible();
    expect(screen.queryByText('Double room')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Бесплатная отмена'));
    expect(screen.getByText(/Нет подходящих вариантов/)).toBeVisible();
  });
  it('expands amenities and presents reviews and similar hotel links', async () => {
    open(); await screen.findByRole('heading', { name: 'Hotel One' });
    await userEvent.click(screen.getByRole('button', { name: /Все удобства/ }));
    expect(screen.getByText(/Фитнес/)).toBeVisible();
    expect(screen.getByText('Отличное место')).toBeVisible();
    expect(await screen.findByRole('link', { name: /Hotel Two/ })).toHaveAttribute('href', `/hotel/two${query}`);
  });
  it('shows a helpful missing hotel state and search link', async () => {
    open(`/hotel/missing${query}`);
    expect(await screen.findByRole('heading', { name: /Отель не найден/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Вернуться к поиску/ })).toHaveAttribute('href', `/search${query}`);
  });
});
