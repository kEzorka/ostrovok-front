import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { appRoutes } from './routes';
import { Button } from '../shared/ui/Button';
import { FieldShell } from '../shared/ui/FieldShell';

describe('application shell', () => {
  // Removing the outlet or shared navigation must break the visible shell contract.
  it('renders the shared shell and a route outlet', () => {
    const router = createMemoryRouter([
      {
        element: <App />,
        children: [{ index: true, element: <h1>Содержимое маршрута</h1> }],
      },
    ]);
    render(<RouterProvider router={router} />);

    expect(screen.getByRole('link', { name: 'Островок! — на главную' })).toBeVisible();
    const navigation = within(screen.getByRole('navigation', { name: 'Основная навигация' }));
    for (const name of ['Избранное', 'Уведомления', 'Помощь', 'Войти']) {
      expect(navigation.getByRole('link', { name })).toBeVisible();
    }
    expect(screen.getByRole('button', { name: 'Меню' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Содержимое маршрута' })).toBeVisible();
    expect(screen.getByRole('contentinfo')).toBeVisible();
  });

  it.each([
    ['/', 'Отели и апартаменты'],
    ['/search', 'Поиск отелей'],
    ['/hotel/demo-hotel', 'Об отеле'],
    ['/checkout/demo-rate', 'Демо-подтверждение'],
    ['/transfers', 'Трансферы'],
    ['/unknown-page', 'Страница не найдена'],
  ])('provides a local placeholder at %s', (path, heading) => {
    render(<RouterProvider router={createMemoryRouter(appRoutes, { initialEntries: [path] })} />);
    expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
  });

  it('opens the keyboard-accessible menu and navigates to a local information page', async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={createMemoryRouter(appRoutes)} />);
    const menu = screen.getByRole('button', { name: 'Меню' });
    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('link', { name: 'О сервисе' }));
    expect(screen.getByRole('heading', { name: 'О сервисе', level: 1 })).toBeVisible();
  });
});

describe('shared controls', () => {
  it('keeps a disabled action from firing and defaults to a non-submit button', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Продолжить</Button>);
    const button = screen.getByRole('button', { name: 'Продолжить' });
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('associates field labels and validation feedback with the input', () => {
    render(
      <FieldShell label="Направление" controlId="destination" error="Выберите город">
        <input id="destination" aria-invalid="true" aria-describedby="destination-error" />
      </FieldShell>,
    );
    expect(screen.getByRole('textbox', { name: 'Направление' })).toHaveAccessibleDescription('Выберите город');
    expect(screen.getByRole('alert')).toHaveTextContent('Выберите город');
  });
});
