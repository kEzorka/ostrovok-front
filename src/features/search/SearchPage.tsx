import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { serializeSearchState } from '../../domain/searchParams';
import type { Destination, HotelType } from '../../domain/types';
import { apiClient } from '../../shared/api/client';
import { appStorage } from '../../shared/storage/appStorage';
import { Modal } from '../../shared/ui/Modal';
import { HotelSearchForm } from '../search-form/HotelSearchForm';
import { FilterDrawer } from './FilterDrawer';
import { HotelCard } from './HotelCard';
import { LocalMap } from './LocalMap';
import { SortSelect } from './SortSelect';
import { useHotelSearch } from './useHotelSearch';
import styles from './SearchPage.module.css';

export function SearchPage() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const location = useLocation();
  const { state, catalog, hotels, filters, setFilters, sort, setSort, status } = useHotelSearch(params);
  const [favorites, setFavorites] = useState(() => appStorage.getFavorites());
  const [drawer, setDrawer] = useState(false), [edit, setEdit] = useState(false), [map, setMap] = useState(false);
  const [category, setCategory] = useState<'all' | HotelType>('all'); const [selection, setSelection] = useState<{ id: string; query: string } | null>(null);
  const [selectionQuery, setSelectionQuery] = useState(params.toString());
  if (selectionQuery !== params.toString()) { setSelectionQuery(params.toString()); setSelection(null); }
  const selected = selection?.query === params.toString() ? selection.id : null;
  const setSelected = (id: string | null) => setSelection(id === null ? null : { id, query: params.toString() });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  useEffect(() => { let active = true; apiClient.searchDestinations().then(result => { if (active && Array.isArray(result.destinations)) setDestinations(result.destinations); }).catch(() => {}); return () => { active = false; }; }, []);
  const shown = category === 'all' ? hotels : hotels.filter(hotel => hotel.type === category);
  const activeSelected = shown.some(hotel => hotel.id === selected) ? selected : null;
  const reset = () => { setFilters({}); setCategory('all'); setSelected(null); };
  const toggleFavorite = (id: string) => { const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id]; setFavorites(next); appStorage.setFavorites(next); };
  const destination = destinations.find(item => item.id === state.destination)?.name ?? state.destination;
  const filterContent = <FilterDrawer filters={filters} onChange={next => { setFilters(next); setSelected(null); }} onReset={reset} />;
  return <div className={styles.page}><div className={styles.layout}><aside className={styles.sidebar}><button className={styles.summary} onClick={() => setEdit(true)}><strong>{destination}</strong><span>{state.checkIn} — {state.checkOut} · {state.adults + state.children.length} гостей</span></button>{filterContent}</aside><div className={styles.main}><div className={styles.mobileBar}><button className={styles.summary} onClick={() => setEdit(true)}><strong>{destination}</strong><span>{state.checkIn} — {state.checkOut}</span></button><button onClick={() => setDrawer(true)} aria-label="Фильтры">☷</button><button onClick={() => setMap(!map)} aria-label={map ? 'Списком' : 'На карте'}>{map ? '☰' : '⌖'}</button></div><div className={styles.tabs} role="group" aria-label="Тип размещения">{([['all', 'Все варианты'], ['hotel', 'Отели'], ['apartment', 'Апартаменты']] as const).map(([value, label]) => <button key={value} aria-pressed={category === value} onClick={() => { setCategory(value); setSelected(null); }}>{label}</button>)}</div><div className={styles.heading}><div><h1>Поиск отелей</h1><h2>{destination}: варианты размещения</h2><p>Найдено: {shown.length}</p></div><div className={styles.controls}><SortSelect value={sort} onChange={setSort} /><button className={styles.mapToggle} onClick={() => setMap(!map)}>{map ? 'Списком' : 'На карте'}</button></div></div>{status === 'loading' ? <p>Загружаем варианты…</p> : status === 'error' ? <p role="alert">Не удалось загрузить варианты. Обновите страницу.</p> : shown.length === 0 ? <div className={styles.empty}><h2>Ничего не найдено</h2><p>Попробуйте изменить параметры поиска или сбросить фильтры.</p><button onClick={reset}>Сбросить фильтры</button></div> : <><div className={map ? styles.activeMap : styles.hiddenMap}><LocalMap hotels={shown} catalog={catalog} state={state} filters={filters} selected={activeSelected} onSelect={setSelected} /></div><ul className={styles.list} aria-label="Результаты поиска">{shown.filter(hotel => !map || !activeSelected || hotel.id === activeSelected).map(hotel => <li key={hotel.id}><HotelCard hotel={hotel} state={state} filters={filters} query={location.search} favorite={favorites.includes(hotel.id)} onFavorite={() => toggleFavorite(hotel.id)} /></li>)}</ul></>}</div><aside className={styles.mapAside}><LocalMap hotels={shown} catalog={catalog} state={state} filters={filters} selected={activeSelected} onSelect={id => { setSelected(id); setMap(true); }} /></aside></div><Modal open={drawer} title="Фильтры" onClose={() => setDrawer(false)}>{filterContent}<button className={styles.done} onClick={() => setDrawer(false)}>Показать варианты</button></Modal><Modal open={edit} title="Изменить поиск" onClose={() => setEdit(false)}><HotelSearchForm compact key={params.toString()} initialState={state} onSubmit={next => { appStorage.setLastSearch(next); setEdit(false); navigate(`/search?${serializeSearchState(next)}`); }} /></Modal></div>;
}
