import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { parseSearchParams } from '../../domain/searchParams';
import { calculateStayPrice } from '../../domain/pricing';
import type { Hotel } from '../../domain/types';
import { ApiError, apiClient } from '../../shared/api/client';
import { HotelGallery } from './HotelGallery';
import { HotelSections } from './HotelSections';
import { RateFilters } from './RateFilters';
import type { RateFilterState } from './RateFilters';
import { RoomRateCard } from './RoomRateCard';
import styles from './HotelPage.module.css';

const initialFilters: RateFilterState = { bed: '', meal: '', payment: '', cancellation: false };
type Result = { slug: string; hotel?: Hotel; error?: 'missing' | 'network' };
export function HotelPage() {
  const { slug = '' } = useParams();
  const { search } = useLocation();
  const state = parseSearchParams(new URLSearchParams(search));
  const [result, setResult] = useState<Result>();
  const [similarResult, setSimilarResult] = useState<{ key: string; hotels: Hotel[] }>();
  const similarKey = `${slug}\n${search}`;
  const [requestedKey, setRequestedKey] = useState(similarKey);
  if (requestedKey !== similarKey) { setRequestedKey(similarKey); setSimilarResult(undefined); }
  const [filters, setFilters] = useState(initialFilters);
  useEffect(() => {
    let active = true;
    apiClient.getHotel(slug).then(({ hotel }) => { if (active) setResult({ slug, hotel }); }).catch(error => { if (active) setResult({ slug, error: error instanceof ApiError && error.status === 404 ? 'missing' : 'network' }); });
    return () => { active = false; };
  }, [slug]);
  useEffect(() => {
    let active = true;
    apiClient.searchHotels(state).then(({ hotels }) => { if (active) setSimilarResult({ key: similarKey, hotels: hotels.filter(hotel => hotel.slug !== slug).slice(0, 3) }); }).catch(() => { if (active) setSimilarResult({ key: similarKey, hotels: [] }); });
    return () => { active = false; };
  // Search changes are identified by the URL, not the parsed object identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, search]);
  if (!result || result.slug !== slug) return <div className={styles.page}><p>Загружаем отель…</p></div>;
  if (!result.hotel) return <div className={styles.page}><section className={styles.section}><h1>{result.error === 'missing' ? 'Отель не найден' : 'Не удалось загрузить отель'}</h1><p>{result.error === 'missing' ? 'Проверьте адрес или выберите другой вариант.' : 'Попробуйте обновить страницу.'}</p><Link to={`/search${search}`}>Вернуться к поиску</Link></section></div>;
  const hotel = result.hotel;
  const available = hotel.rates.filter(rate => rate.availableRooms >= state.rooms && rate.maxGuests >= Math.ceil((state.adults + state.children.length) / state.rooms));
  const rates = available.filter(rate => (!filters.bed || rate.bedType === filters.bed) && (!filters.meal || rate.meal === filters.meal) && (!filters.payment || rate.payment === filters.payment) && (!filters.cancellation || rate.freeCancellation));
  const minimum = rates.length ? Math.min(...rates.map(rate => calculateStayPrice(rate, state))) : null;
  const similar = similarResult?.key === similarKey ? similarResult.hotels : [];
  return <div className={styles.page}>
    <div className={styles.topLinks}><Link to={`/search${search}`}>← Назад к результатам</Link><Link to={`/search${search}`}>Изменить поиск</Link></div>
    <header className={styles.title}><div><div className={styles.stars}>{'★'.repeat(hotel.stars)}</div><h1>{hotel.name}</h1><p>{hotel.address}</p></div><div className={styles.titleAction}>{minimum !== null ? <><div><small>Цена за всё проживание</small><strong>от {minimum.toLocaleString('ru-RU')} ₽</strong></div><a href="#rooms">Посмотреть цены</a></> : <strong>Нет доступных цен</strong>}</div></header>
    <HotelGallery key={hotel.slug} hotel={hotel} />
    <div className={styles.highlights}><a href="#reviews"><span className={styles.score}>{hotel.rating}</span><strong>Отлично</strong><small>{hotel.reviewCount} отзывов</small></a><a href="#amenities"><strong>Удобства</strong><small>{hotel.amenities.length} удобств и услуг</small></a><a href="#location"><strong>Расположение</strong><small>{hotel.distanceFromCenter} км от центра</small></a></div>
    <section className={styles.section} id="rooms"><h2>Доступные номера</h2><p className={styles.summary}>{state.checkIn} — {state.checkOut} · {state.adults + state.children.length} гостей · {state.rooms} номер(а)</p><RateFilters value={filters} onChange={setFilters} />{rates.length ? rates.map(rate => <RoomRateCard key={rate.id} rate={rate} state={state} query={search} image={hotel.images[1] ?? hotel.images[0]} />) : <div className={styles.empty}><strong>Нет подходящих вариантов</strong><p>Попробуйте изменить параметры или фильтры.</p><button onClick={() => setFilters(initialFilters)}>Сбросить фильтры</button></div>}</section>
    <div className={styles.sectionsWrapper}><HotelSections key={hotel.slug} hotel={hotel} similar={similar} query={search} /></div>
    <div className={styles.mobileCta}>{minimum !== null ? <><div><small>За всё проживание</small><strong>от {minimum.toLocaleString('ru-RU')} ₽</strong></div><a href="#rooms">Выбрать номер</a></> : <strong>Нет доступных номеров</strong>}</div>
  </div>;
}
