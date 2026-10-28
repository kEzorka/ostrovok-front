import styles from './HotelPage.module.css';
export interface RateFilterState { bed: string; meal: string; payment: string; cancellation: boolean }
export function RateFilters({ value, onChange }: { value: RateFilterState; onChange: (value: RateFilterState) => void }) {
  return <div className={styles.filters}>
    <label>Кровать<select value={value.bed} onChange={event => onChange({ ...value, bed: event.target.value })}><option value="">Любая кровать</option><option value="double">Двуспальная</option><option value="twin">Две кровати</option><option value="bunk">Двухъярусная</option></select></label>
    <label>Питание<select value={value.meal} onChange={event => onChange({ ...value, meal: event.target.value })}><option value="">Любое питание</option><option value="none">Без питания</option><option value="breakfast">Завтрак</option><option value="half-board">Полупансион</option><option value="full-board">Полный пансион</option></select></label>
    <label>Оплата<select value={value.payment} onChange={event => onChange({ ...value, payment: event.target.value })}><option value="">Любая оплата</option><option value="now">Сейчас</option><option value="at-hotel">В отеле</option></select></label>
    <label className={styles.check}><input type="checkbox" checked={value.cancellation} onChange={event => onChange({ ...value, cancellation: event.target.checked })} /> Бесплатная отмена</label>
  </div>;
}
