import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Modal } from './Modal';
import { Popover } from './Popover';

describe('overlays', () => {
  it('opens a popover and closes on Escape, returning focus', async () => {
    const user = userEvent.setup();
    render(<Popover label="Настройки" trigger="Открыть"><button>Действие</button></Popover>);
    const trigger = screen.getByRole('button', { name: 'Открыть' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Настройки' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('closes a modal on Escape and returns focus to its opener', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Открыть</button><Modal open={open} title="Подробности" onClose={() => setOpen(false)}><p>Содержимое</p></Modal></>;
    }
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Открыть' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Подробности' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
