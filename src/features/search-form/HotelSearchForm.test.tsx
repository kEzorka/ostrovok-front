import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appRoutes } from '../../app/routes';

describe('search popover', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('does not allow stale destination options while a new query is pending', async () => {
    vi.stubGlobal('fetch', (url: string) => url.includes('q=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0')
      ? Promise.resolve(new Response(JSON.stringify({ destinations: [{ id: 'moscow', name: 'Москва', country: 'Россия' }] })))
      : new Promise(() => {}));
    const user = userEvent.setup();
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    const input = screen.getByRole('combobox', { name: 'Направление' });
    await user.click(input);
    const staleOption = await screen.findByRole('option', { name: 'Москва, Россия' });
    expect(staleOption).toBeVisible();
    fireEvent.change(input, { target: { value: 'Казань' } });
    expect(screen.queryByRole('option', { name: 'Москва, Россия' })).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    fireEvent.click(staleOption);
    expect(input).toHaveValue('Казань');
  });
  it('exposes the active option and closes the list when focus leaves', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ destinations: [{ id: 'moscow', name: 'Москва', country: 'Россия' }] })));
    const user = userEvent.setup();
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    const input = screen.getByRole('combobox', { name: 'Направление' });
    await user.click(input);
    const option = await screen.findByRole('option');
    expect(input).toHaveAttribute('aria-activedescendant', option.id);
    expect(option.id).not.toBe('');
    await user.tab();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(input);
    expect(await screen.findByRole('listbox')).toBeVisible();
    await user.click(document.body);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('opens a labelled guest dialog, adjusts guests, and returns focus on Escape', async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    const trigger = screen.getByRole('button', { name: /гост/ });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    const dialog = screen.getByRole('dialog', { name: 'Гости и номера' });
    await user.click(within(dialog).getByRole('button', { name: 'Добавить взрослого' }));
    expect(trigger).toHaveTextContent('3 гост');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Гости и номера' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('switches transfer direction and omits the return date for one-way searches', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(appRoutes);
    render(<RouterProvider router={router} />);
    await user.click(screen.getByRole('button', { name: 'Трансферы' }));
    expect(screen.queryByLabelText('Дата обратно')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Туда и обратно'));
    await user.type(screen.getByLabelText('Дата обратно'), '2026-11-07');
    await user.click(screen.getByLabelText('В одну сторону'));
    expect(screen.queryByLabelText('Дата обратно')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Откуда'), 'Москва');
    await user.type(screen.getByLabelText('Куда'), 'Внуково');
    await user.type(screen.getByLabelText('Дата поездки'), '2026-11-05');
    await user.click(screen.getByRole('button', { name: 'Найти' }));
    expect(router.state.location.pathname).toBe('/transfers');
    expect(new URLSearchParams(router.state.location.search).has('returnDate')).toBe(false);
  });
});
