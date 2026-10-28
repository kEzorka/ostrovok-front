import { Link } from 'react-router-dom';
import { calculateStayPrice } from '../../domain/pricing';
import type { HotelRate, SearchState } from '../../domain/types';
import styles from './HotelPage.module.css';
const meals = { none: 'Без питания', breakfast: 'Завтрак включён', 'half-board': 'Полупансион', 'full-board': 'Полный пансион' };
const beds = { double: 'Двуспальная кровать', twin: 'Две отдельные кровати', bunk: 'Двухъярусная кровать' };
export function RoomRateCard({ rate, state, query, image, hotelSlug }: { rate: HotelRate; state: SearchState; query: string; image?: string; hotelSlug: string }) {
  const original = rate.originalNightlyPrice !== undefined && rate.originalNightlyPrice > rate.nightlyPrice ? calculateStayPrice({ ...rate, nightlyPrice: rate.originalNightlyPrice }, state) : null;
  const params = new URLSearchParams(query); params.set('hotel', hotelSlug);
  return <article className={styles.room}><div className={styles.roomInfo}>{image && <img src={image} alt="" />}<h3>{rate.roomName}</h3><p>{beds[rate.bedType]}</p><p>До {rate.maxGuests} гостей</p></div><div className={styles.rateMatrix}><div className={styles.rate}><strong>{meals[rate.meal]}</strong><p className={rate.freeCancellation ? styles.green : ''}>{rate.freeCancellation ? 'Бесплатная отмена' : 'Без бесплатной отмены'}</p><p>{rate.payment === 'now' ? 'Оплата сейчас' : 'Оплата в отеле'}</p><p>Осталось {rate.availableRooms} номер(а)</p><div className={styles.ratePrice}><small>За всё проживание</small>{original !== null && <del>{original.toLocaleString('ru-RU')} ₽</del>}<strong>{calculateStayPrice(rate, state).toLocaleString('ru-RU')} ₽</strong><Link aria-label={`Выбрать ${rate.roomName}`} to={`/checkout/${encodeURIComponent(rate.id)}?${params}`}>Выбрать</Link></div></div></div></article>;
}
