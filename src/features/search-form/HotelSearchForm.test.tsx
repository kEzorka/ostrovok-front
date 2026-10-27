import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { appRoutes } from '../../app/routes';

describe('search popover', () => {
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
    await user.click(screen.getByRole('tab', { name: 'Трансферы' }));
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
