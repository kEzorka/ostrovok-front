import type { SortMode } from '../../domain/types';
export function SortSelect({ value, onChange }: { value: SortMode; onChange: (sort: SortMode) => void }) {
  return <label>Сортировка <select aria-label="Сортировка" value={value} onChange={event => onChange(event.target.value as SortMode)}><option value="popular">Популярные</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="rating">По рейтингу</option></select></label>;
}
