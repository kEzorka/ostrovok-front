import type { ReactNode } from 'react';
import styles from './FieldShell.module.css';

export interface FieldShellProps {
  label: string;
  controlId: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
}

/** Set the child control's id to controlId and aria-describedby to the hint/error id. */
export function FieldShell({ label, controlId, children, hint, error, className = '' }: FieldShellProps) {
  return (
    <div className={[styles.shell, error ? styles.invalid : '', className].filter(Boolean).join(' ')}>
      <div className={styles.control}>
        <label className={styles.label} htmlFor={controlId}>{label}</label>
        {children}
      </div>
      {error ? (
        <p className={styles.error} id={`${controlId}-error`} role="alert">{error}</p>
      ) : hint ? (
        <p className={styles.hint} id={`${controlId}-hint`}>{hint}</p>
      ) : null}
    </div>
  );
}
