import type { Hotel, SearchState } from '../../domain/types';
import { calculateStayPrice } from '../../domain/pricing';
import styles from './SearchPage.module.css';
export function LocalMap({ hotels, state, selected, onSelect }: { hotels: Hotel[]; state: SearchState; selected: string | null; onSelect: (id: string) => void }) {
  const lats = hotels.map(h => h.coordinates.lat), lngs = hotels.map(h => h.coordinates.lng);
  const position = (value: number, values: number[]) => values.length < 2 || Math.max(...values) === Math.min(...values) ? 50 : 12 + 76 * (value - Math.min(...values)) / (Math.max(...values) - Math.min(...values));
  return <div className={styles.map} aria-label="Карта отелей"><div className={styles.mapLabel}>Карта размещения</div>{hotels.map(hotel => <button key={hotel.id} className={styles.marker} aria-label={`Показать ${hotel.name} на карте`} aria-pressed={selected === hotel.id} onClick={() => onSelect(hotel.id)} style={{ left: `${position(hotel.coordinates.lng, lngs)}%`, top: `${100 - position(hotel.coordinates.lat, lats)}%` }}>{Math.min(...hotel.rates.map(rate => calculateStayPrice(rate, state))).toLocaleString('ru-RU')} ₽</button>)}</div>;
}
