import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Amenity, Hotel } from '../../domain/types';
import styles from './HotelPage.module.css';
const amenityNames: Record<Amenity, string> = { wifi: 'Wi-Fi', parking: 'Парковка', pool: 'Бассейн', spa: 'Спа', fitness: 'Фитнес', kitchen: 'Кухня', pets: 'Можно с питомцами', 'air-conditioning': 'Кондиционер' };
export function HotelSections({ hotel, similar, query }: { hotel: Hotel; similar: Hotel[]; query: string }) {
  const [expanded, setExpanded] = useState(false);
  return <>
    <section className={styles.section} id="location"><h2>Расположение</h2><div className={styles.location}><div><strong>⌖ {hotel.address}</strong><p>{hotel.distanceFromCenter} км от центра</p></div><div className={styles.map} aria-label="Схема расположения">⌖<span>{hotel.name}</span></div></div></section>
    <section className={styles.section}><h2>Об отеле</h2><p>{hotel.description}</p></section>
    <section className={styles.section}><h2>Удобства и услуги</h2><ul className={styles.amenities}>{hotel.amenities.slice(0, expanded ? undefined : 4).map(item => <li key={item}>✓ {amenityNames[item]}</li>)}</ul>{hotel.amenities.length > 4 && <button className={styles.secondary} onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Свернуть' : `Все удобства · ${hotel.amenities.length}`}</button>}</section>
    <section className={styles.section}><h2>Правила размещения</h2><div className={styles.policy}><p>Заезд <strong>с {hotel.checkInTime}</strong></p><p>Выезд <strong>до {hotel.checkOutTime}</strong></p></div></section>
    <section className={styles.section} id="reviews"><h2>Отзывы гостей</h2><p><span className={styles.score}>{hotel.rating}</span> Отлично · {hotel.reviewCount} отзывов</p>{hotel.reviews.map(review => <article className={styles.review} key={review.id}><strong>{review.author}</strong><span>{review.date} · {review.rating}</span><p>{review.text}</p></article>)}</section>
    {similar.length > 0 && <section className={styles.section}><h2>Похожие варианты</h2><div className={styles.similar}>{similar.map(item => <Link key={item.id} to={`/hotel/${item.slug}${query}`}>{item.images[0] && <img src={item.images[0]} alt="" />}<strong>{item.name}</strong><span>★ {item.rating} · {item.address}</span></Link>)}</div></section>}
  </>;
}
