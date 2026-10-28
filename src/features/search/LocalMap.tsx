import type { Hotel, HotelFilters, SearchState } from '../../domain/types';
import { matchingPrice } from './matchingPrice';
import styles from './SearchPage.module.css';
export function LocalMap({ hotels, state, filters, selected, onSelect }: { hotels: Hotel[]; state: SearchState; filters: HotelFilters; selected: string | null; onSelect: (id: string) => void }) {
  const ordered = [...hotels].sort((a, b) => b.coordinates.lat - a.coordinates.lat || a.coordinates.lng - b.coordinates.lng || a.id.localeCompare(b.id));
  return <div className={styles.map} aria-label="Карта отелей"><div className={styles.mapLabel}>Карта размещения</div><div className={styles.markers}>{ordered.map(hotel => <button key={hotel.id} className={styles.marker} aria-label={`Показать ${hotel.name} на карте`} aria-pressed={selected === hotel.id} onClick={() => onSelect(hotel.id)}>{matchingPrice(hotel, state, filters).toLocaleString('ru-RU')} ₽</button>)}</div></div>;
}
