import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import styles from './overlay.module.css';
export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus();
  }, [open]);
  if (!open) return null;
  return <div className={styles.backdrop} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className={styles.modal} onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? []);
      if (!items.length) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === items[0] || document.activeElement === ref.current)) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    }
  }}><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Закрыть">×</button>{children}</div></div>;
}
