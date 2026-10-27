import { useState } from 'react';
import type { TransferQuery } from '../../domain/types';
import styles from './searchForm.module.css';
export function TransferSearchForm({ onSubmit }: { onSubmit: (query: TransferQuery) => void }) {
  const [query, setQuery] = useState<TransferQuery>({ from: '', to: '', date: '', time: '12:00', passengers: 1 });
  const [roundTrip, setRoundTrip] = useState(false);
  const [error, setError] = useState('');
  const update = (patch: Partial<TransferQuery>) => setQuery(previous => ({ ...previous, ...patch }));
  return <form className={styles.card} noValidate onSubmit={event => { event.preventDefault(); if (!query.from.trim() || !query.to.trim() || !query.date || !query.time || (roundTrip && (!query.returnDate || query.returnDate < query.date))) { setError('Заполните маршрут и корректные даты поездки'); return; } setError(''); const result = { ...query }; if (!roundTrip) delete result.returnDate; onSubmit(result); }}>
    <div className={styles.extras}><label><input type="radio" name="direction" checked={!roundTrip} onChange={() => setRoundTrip(false)} /> В одну сторону</label><label><input type="radio" name="direction" checked={roundTrip} onChange={() => setRoundTrip(true)} /> Туда и обратно</label></div>
    <div className={styles.transferRow}><label className={styles.field}>Откуда<input aria-label="Откуда" value={query.from} onChange={event => update({ from: event.target.value })} /></label><label className={styles.field}>Куда<input aria-label="Куда" value={query.to} onChange={event => update({ to: event.target.value })} /></label><label className={styles.field}>Дата поездки<input aria-label="Дата поездки" type="date" value={query.date} onChange={event => update({ date: event.target.value })} /></label><label className={styles.field}>Время<input aria-label="Время" type="time" value={query.time} onChange={event => update({ time: event.target.value })} /></label>{roundTrip && <label className={styles.field}>Дата обратно<input aria-label="Дата обратно" type="date" value={query.returnDate ?? ''} onChange={event => update({ returnDate: event.target.value })} /></label>}<label className={styles.field}>Пассажиры<select aria-label="Пассажиры" value={query.passengers} onChange={event => update({ passengers: Number(event.target.value) })}>{Array.from({ length: 8 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label><button className={styles.submit} type="submit">Найти</button></div>{error && <p role="alert" className={styles.error}>{error}</p>}
  </form>;
}
