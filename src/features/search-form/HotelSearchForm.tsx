import { useState } from 'react';
import type { SearchState } from '../../domain/types';
import { dateTimestamp } from '../../domain/dates';
import { DestinationCombobox } from './DestinationCombobox';
import { DateRangePicker } from './DateRangePicker';
import { GuestsPopover } from './GuestsPopover';
import styles from './searchForm.module.css';
export function HotelSearchForm({ initialState, onSubmit, compact = false }: { initialState: SearchState; onSubmit: (state: SearchState) => void; compact?: boolean }) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState('');
  const update = (patch: Partial<SearchState>) => setState(previous => ({ ...previous, ...patch }));
  return <form className={`${styles.card} ${compact ? styles.compact : ''}`} noValidate onSubmit={event => { event.preventDefault(); if (!state.destination) { setError('Выберите направление'); return; } if (!dateTimestamp(state.checkIn) || !dateTimestamp(state.checkOut) || state.checkOut <= state.checkIn) { setError('Дата выезда должна быть позже даты заезда'); return; } setError(''); onSubmit(state); }}>
    <div className={styles.row}><DestinationCombobox value={state.destination} onChange={destination => update({ destination })} /><DateRangePicker checkIn={state.checkIn} checkOut={state.checkOut} onChange={(field, value) => update({ [field]: value })} /><GuestsPopover state={state} onChange={update} /><button className={styles.submit} type="submit">Найти</button></div>
    <div className={styles.extras}><label>Только апартаменты <input type="checkbox" checked={state.apartmentsOnly} onChange={event => update({ apartmentsOnly: event.target.checked })} /></label><label><input type="radio" name="trip" checked={state.tripType === 'leisure'} onChange={() => update({ tripType: 'leisure' })} /> Отдых</label><label><input type="radio" name="trip" checked={state.tripType === 'business'} onChange={() => update({ tripType: 'business' })} /> Командировка</label></div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </form>;
}
