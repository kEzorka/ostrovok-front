import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../../app/routes';
import { testHotel, testRate } from '../../test/domainFixtures';

const query = '?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=2&adults=2&hotel=one';
const hotel = testHotel({ name: 'Hotel One', rates: [testRate, { ...testRate, id: 'sold-out', availableRooms: 1 }] });
beforeEach(() => vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ hotel }), { status: 200 })));
afterEach(() => vi.restoreAllMocks());
function open(rate: string) { render(<RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: [`/checkout/${rate}${query}`] })} />); }

describe('demo checkout', () => {
  it('shows the selected stay and total, and confirms only locally without personal fields', async () => {
    open('rate-1');
    expect(await screen.findByText('Hotel One')).toBeVisible();
    expect(screen.getByText('Standard')).toBeVisible();
    expect(screen.getByText(/2026-10-31.*2026-11-03/)).toBeVisible();
    expect(screen.getByText(/15\s*000 ₽/)).toBeVisible();
    expect(screen.getByText(/демо.*не.*бронирован/i)).toBeVisible();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(document.querySelector('form')).toBeNull();
    const calls = vi.mocked(fetch).mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: /подтвердить/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/демо/i);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(calls);
  });
  it.each(['unknown', 'sold-out'])('prevents confirmation for unavailable rate %s and links back to the hotel', async rate => {
    open(rate);
    expect(await screen.findByRole('heading', { name: /тариф недоступен/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /подтвердить/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /вернуться к отелю/i })).toHaveAttribute('href', `/hotel/one${query}`);
  });
  it('clears confirmation when leaving and returning to the same rate', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [`/checkout/rate-1${query}`] });
    render(<RouterProvider router={router} />);
    await userEvent.click(await screen.findByRole('button', { name: /подтвердить/i }));
    await act(async () => { await router.navigate(`/checkout/unknown${query}`); });
    await screen.findByRole('heading', { name: /тариф недоступен/i });
    await act(async () => { await router.navigate(`/checkout/rate-1${query}`); });
    expect(await screen.findByRole('button', { name: /подтвердить/i })).toBeVisible();
  });
});
