import { useEffect, useId, useRef, useState } from 'react';
import type { Destination } from '../../domain/types';
import { apiClient } from '../../shared/api/client';
import styles from './searchForm.module.css';

export function DestinationCombobox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(value === 'moscow' ? 'Москва, Россия' : value);
  const [options, setOptions] = useState<Destination[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) { if (!containerRef.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let current = true;
    apiClient.searchDestinations(text).then(result => { if (current) { setOptions(result.destinations); setActive(0); } }).catch(() => { if (current) setOptions([]); });
    return () => { current = false; };
  }, [text, open]);
  function choose(option: Destination) { setText(`${option.name}, ${option.country}`); onChange(option.id); setOpen(false); }
  const visible = open && options.length > 0;
  return <div ref={containerRef} className={styles.destination}>
    <label className={styles.field}>Направление<input role="combobox" aria-label="Направление" aria-expanded={visible} aria-controls={visible ? listId : undefined} aria-activedescendant={visible ? `${listId}-${active}` : undefined} aria-autocomplete="list" value={text} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onChange={event => { setOptions([]); setActive(0); setText(event.target.value); onChange(''); setOpen(true); }} onKeyDown={event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(index + 1, options.length - 1)); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(index - 1, 0)); }
      if (event.key === 'Enter' && open && options[active]) { event.preventDefault(); choose(options[active]); }
      if (event.key === 'Escape') setOpen(false);
    }} /></label>
    {visible && <ul id={listId} className={styles.options} role="listbox">{options.map((option, index) => <li id={`${listId}-${index}`} key={option.id} role="option" aria-selected={index === active} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>{option.name}, {option.country}</li>)}</ul>}
  </div>;
}
