import { useState } from 'react';
import type { SearchState } from '../../domain/types';
import styles from './searchForm.module.css';
export function GuestsPopover({ state, onChange }: { state: SearchState; onChange: (patch: Partial<SearchState>) => void }) {
  const [open, setOpen] = useState(false);
  const counters = [
    { label: 'Номера', singular: 'номер', value: state.rooms, min: 1, max: 9, key: 'rooms' as const },
    { label: 'Взрослые', singular: 'взрослого', value: state.adults, min: 1, max: 30, key: 'adults' as const },
    { label: 'Дети', singular: 'ребёнка', value: state.children.length, min: 0, max: 10, key: 'children' as const },
  ];
  return <div className={styles.guests}><button className={styles.guestButton} type="button" aria-expanded={open} onClick={() => setOpen(!open)}><small>{state.rooms} номер</small>{state.adults + state.children.length} гостя ▾</button>
    {open && <div className={styles.popover}>{counters.map(counter => <div className={styles.counter} key={counter.key}><span>{counter.label}</span><div><button type="button" aria-label={`Убрать ${counter.singular}`} disabled={counter.value <= counter.min} onClick={() => onChange(counter.key === 'children' ? { children: state.children.slice(0, -1) } : { [counter.key]: counter.value - 1 })}>−</button><span>{counter.value}</span><button type="button" aria-label={`Добавить ${counter.singular}`} disabled={counter.value >= counter.max} onClick={() => onChange(counter.key === 'children' ? { children: [...state.children, 0] } : { [counter.key]: counter.value + 1 })}>+</button></div></div>)}
      {state.children.map((age, index) => <label key={index}>Возраст ребёнка {index + 1}<select aria-label={`Возраст ребёнка ${index + 1}`} value={age} onChange={event => onChange({ children: state.children.map((item, i) => i === index ? Number(event.target.value) : item) })}>{Array.from({ length: 18 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select></label>)}
      <button type="button" onClick={() => setOpen(false)}>Готово</button></div>}
  </div>;
}
