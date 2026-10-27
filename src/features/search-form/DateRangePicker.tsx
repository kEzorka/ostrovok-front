import styles from './searchForm.module.css';
export function DateRangePicker({ checkIn, checkOut, onChange }: { checkIn: string; checkOut: string; onChange: (field: 'checkIn' | 'checkOut', value: string) => void }) {
  function display(value: string) {
    if (!value) return 'Выберите дату';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? 'Выберите дату' : date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return <div className={styles.dates}>
    <label className={`${styles.field} ${styles.dateField}`}>Заезд<span>{display(checkIn)}</span><input aria-label="Заезд" type="date" value={checkIn} onChange={event => onChange('checkIn', event.target.value)} /></label>
    <label className={`${styles.field} ${styles.dateField}`}>Выезд<span>{display(checkOut)}</span><input aria-label="Выезд" type="date" value={checkOut} onChange={event => onChange('checkOut', event.target.value)} /></label>
  </div>;
}
