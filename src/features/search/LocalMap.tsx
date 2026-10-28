import type { Hotel, HotelFilters, SearchState } from '../../domain/types';
import { matchingPrice } from './matchingPrice';
import styles from './SearchPage.module.css';
export function LocalMap({ hotels, catalog, state, filters, selected, onSelect }: { hotels: Hotel[]; catalog: Hotel[]; state: SearchState; filters: HotelFilters; selected: string | null; onSelect: (id: string) => void }) {
  const ordered = [...hotels].sort((a, b) => b.coordinates.lat - a.coordinates.lat || a.coordinates.lng - b.coordinates.lng || a.id.localeCompare(b.id));
  const lats = catalog.map(hotel => hotel.coordinates.lat), lngs = catalog.map(hotel => hotel.coordinates.lng);
  const position = (value: number, values: number[]) => values.length < 2 || Math.max(...values) === Math.min(...values) ? 50 : 10 + 80 * (value - Math.min(...values)) / (Math.max(...values) - Math.min(...values));
  return <div className={styles.map} aria-label="Карта отелей"><div className={styles.mapLabel}>Карта размещения</div><div className={styles.mapPlot} aria-hidden="true">{hotels.map(hotel => <span key={hotel.id} data-map-point={hotel.id} className={`${styles.mapPoint} ${selected === hotel.id ? styles.selectedPoint : ''}`} style={{ left: `${position(hotel.coordinates.lng, lngs)}%`, top: `${100 - position(hotel.coordinates.lat, lats)}%` }} />)}</div><div className={styles.markers} aria-label="Выбор отеля на карте">{ordered.map(hotel => <button key={hotel.id} className={styles.marker} aria-label={`Показать ${hotel.name} на карте`} aria-pressed={selected === hotel.id} onClick={() => onSelect(hotel.id)} title={hotel.name}><span>{hotel.name}</span><strong>{matchingPrice(hotel, state, filters).toLocaleString('ru-RU')} ₽</strong></button>)}</div></div>;
}
