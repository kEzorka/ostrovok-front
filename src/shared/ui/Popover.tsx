import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './overlay.module.css';

export function Popover({ label, trigger, children, triggerClassName, contentClassName, closeLabel }: { label: string; trigger: ReactNode; children: ReactNode; triggerClassName?: string; contentClassName?: string; closeLabel?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  function close() { setOpen(false); triggerRef.current?.focus(); }
  return <div className={styles.anchor} onKeyDown={event => { if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(); } }}>
    <button ref={triggerRef} type="button" className={triggerClassName} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}>{trigger}</button>
    {open && <div id={id} role="dialog" aria-label={label} className={contentClassName ?? styles.popover}>{children}{closeLabel && <button type="button" onClick={close}>{closeLabel}</button>}</div>}
  </div>;
}
