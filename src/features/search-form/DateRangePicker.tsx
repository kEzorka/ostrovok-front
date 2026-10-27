import styles from './searchForm.module.css';
export function DateRangePicker({ checkIn, checkOut, onChange }: { checkIn: string; checkOut: string; onChange: (field: 'checkIn' | 'checkOut', value: string) => void }) {
  return <div className={styles.dates}>
    <label className={styles.field}>Заезд<input aria-label="Заезд" type="date" value={checkIn} onChange={event => onChange('checkIn', event.target.value)} /></label>
    <label className={styles.field}>Выезд<input aria-label="Выезд" type="date" value={checkOut} onChange={event => onChange('checkOut', event.target.value)} /></label>
  </div>;
}
