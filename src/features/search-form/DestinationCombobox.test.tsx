import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DestinationCombobox } from './DestinationCombobox';

describe('saved destination labels', () => {
  afterEach(() => vi.unstubAllGlobals());
  it.each([
    ['saint-petersburg', 'Санкт-Петербург'],
    ['kazan', 'Казань'],
  ])('resolves saved ID %s to its Russian label', async (id, name) => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ destinations: [{ id, name, country: 'Россия' }] })));
    render(<DestinationCombobox value={id} onChange={() => {}} />);
    expect(await screen.findByDisplayValue(`${name}, Россия`)).toBeVisible();
  });
  it('does not overwrite text typed while the saved ID lookup is pending', async () => {
    let resolveLookup!: (response: Response) => void;
    vi.stubGlobal('fetch', (url: string) => url.includes('q=kazan')
      ? new Promise<Response>(resolve => { resolveLookup = resolve; })
      : Promise.resolve(new Response(JSON.stringify({ destinations: [] }))));
    render(<DestinationCombobox value="kazan" onChange={() => {}} />);
    await waitFor(() => expect(resolveLookup).toBeTypeOf('function'));
    const input = screen.getByRole('combobox', { name: 'Направление' });
    fireEvent.change(input, { target: { value: 'Сочи' } });
    await act(async () => { resolveLookup(new Response(JSON.stringify({ destinations: [{ id: 'kazan', name: 'Казань', country: 'Россия' }] }))); });
    expect(input).toHaveValue('Сочи');
  });
  it('keeps the ID if its lookup fails', async () => {
    vi.stubGlobal('fetch', async () => { throw new Error('offline'); });
    render(<DestinationCombobox value="unknown-city" onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Направление' })).toHaveValue('unknown-city');
  });
});
