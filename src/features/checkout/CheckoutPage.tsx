import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { calculateStayPrice } from '../../domain/pricing';
import { parseSearchParams } from '../../domain/searchParams';
import type { Hotel } from '../../domain/types';
import { apiClient } from '../../shared/api/client';
import { Button } from '../../shared/ui/Button';
import styles from './CheckoutPage.module.css';

const meals = { none: 'Без питания', breakfast: 'Завтрак включён', 'half-board': 'Полупансион', 'full-board': 'Полный пансион' };
export function CheckoutPage() {
  const { rateId = '' } = useParams();
  const { search, key: locationKey } = useLocation();
  const params = new URLSearchParams(search);
  const slug = params.get('hotel') ?? '';
  const state = parseSearchParams(params);
  const key = `${locationKey}\n${slug}\n${search}\n${rateId}`;
  const [result, setResult] = useState<{ key: string; hotel?: Hotel; error?: boolean }>();
  const [confirmedKey, setConfirmedKey] = useState('');
  useEffect(() => {
    let active = true;
    const request = slug ? apiClient.getHotel(slug).then(({ hotel }) => hotel) : apiClient.searchHotels(parseSearchParams(new URLSearchParams(search))).then(({ hotels }) => hotels.find(hotel => hotel.rates.some(rate => rate.id === rateId)));
    request.then(hotel => { if (active) setResult({ key, hotel }); }).catch(() => { if (active) setResult({ key, error: true }); });
    return () => { active = false; };
  }, [key, slug, search, rateId]);
  if (!result || result.key !== key) return <div className={styles.page}><p>Загружаем выбранный тариф…</p></div>;
  const hotel = result.hotel;
  const rate = hotel?.rates.find(item => item.id === rateId && item.availableRooms >= state.rooms && item.maxGuests >= Math.ceil((state.adults + state.children.length) / state.rooms));
  const back = hotel?.slug || slug;
  if (!hotel || !rate) return <div className={styles.page}><section className={styles.card}><h1>{result.error ? 'Не удалось загрузить тариф' : 'Тариф недоступен'}</h1><p>Вернитесь к выбору номера и попробуйте ещё раз.</p><Link to={back ? `/hotel/${encodeURIComponent(back)}${search}` : `/search${search}`}>{back ? 'Вернуться к отелю' : 'Вернуться к поиску'}</Link></section></div>;
  return <div className={styles.page}>
    <Link className={styles.back} to={`/hotel/${encodeURIComponent(hotel.slug)}${search}`}>← Вернуться к отелю</Link>
    <h1>Проверьте детали поездки</h1>
    <p className={styles.notice}>Демо: это не бронирование. Подтверждение не создаёт заказ и не требует оплаты.</p>
    <div className={styles.grid}><div className={styles.main}>
      <section className={styles.card}><div className={styles.hotel}>{hotel.images[0] && <img src={hotel.images[0]} alt="" />}<div><span className={styles.stars}>{'★'.repeat(hotel.stars)}</span><h2>{hotel.name}</h2><p>{hotel.address}</p><p>Оценка {hotel.rating} · {hotel.reviewCount} отзывов</p></div></div></section>
      <section className={styles.card}><h2>Ваше проживание</h2><div className={styles.dates}><div><small>Заезд</small><strong>{state.checkIn}</strong><span>с {hotel.checkInTime}</span></div><div><small>Выезд</small><strong>{state.checkOut}</strong><span>до {hotel.checkOutTime}</span></div></div><p>{state.checkIn} — {state.checkOut} · {state.adults + state.children.length} гостей · {state.rooms} номер(а)</p><hr /><h3>{rate.roomName}</h3><p>{meals[rate.meal]} · {rate.freeCancellation ? 'Бесплатная отмена' : 'Без бесплатной отмены'}</p></section>
    </div><aside className={styles.card}><h2>Стоимость проживания</h2><p>За всё проживание, включая налоги</p><div className={styles.total}><span>Итого</span><strong>{calculateStayPrice(rate, state).toLocaleString('ru-RU')} ₽</strong></div>{confirmedKey === key ? <p role="status" className={styles.success}>Демо-подтверждение готово. Бронирование не создано.</p> : <Button fullWidth size="large" onClick={() => setConfirmedKey(key)}>Подтвердить в демо</Button>}<p className={styles.hint}>Никакие личные или платёжные данные не нужны.</p></aside></div>
  </div>;
}
