import type { SearchState } from '../../domain/types';
import { Popover } from '../../shared/ui/Popover';
import styles from './searchForm.module.css';
export function GuestsPopover({ state, onChange }: { state: SearchState; onChange: (patch: Partial<SearchState>) => void }) {
  const counters = [
    { label: 'Номера', singular: 'номер', value: state.rooms, min: 1, max: 9, key: 'rooms' as const },
    { label: 'Взрослые', singular: 'взрослого', value: state.adults, min: 1, max: 30, key: 'adults' as const },
    { label: 'Дети', singular: 'ребёнка', value: state.children.length, min: 0, max: 10, key: 'children' as const },
  ];
  return <Popover label="Гости и номера" triggerClassName={styles.guestButton} contentClassName={styles.popover} closeLabel="Готово" trigger={<><small>{state.rooms} номер</small>{state.adults + state.children.length} гостя ▾</>}>
    {counters.map(counter => <div className={styles.counter} key={counter.key}><span>{counter.label}</span><div><button type="button" aria-label={`Убрать ${counter.singular}`} disabled={counter.value <= counter.min} onClick={() => onChange(counter.key === 'children' ? { children: state.children.slice(0, -1) } : { [counter.key]: counter.value - 1 })}>−</button><span>{counter.value}</span><button type="button" aria-label={`Добавить ${counter.singular}`} disabled={counter.value >= counter.max} onClick={() => onChange(counter.key === 'children' ? { children: [...state.children, 0] } : { [counter.key]: counter.value + 1 })}>+</button></div></div>)}
      {state.children.map((age, index) => <label key={index}>Возраст ребёнка {index + 1}<select aria-label={`Возраст ребёнка ${index + 1}`} value={age} onChange={event => onChange({ children: state.children.map((item, i) => i === index ? Number(event.target.value) : item) })}>{Array.from({ length: 18 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select></label>)}
  </Popover>;
}
