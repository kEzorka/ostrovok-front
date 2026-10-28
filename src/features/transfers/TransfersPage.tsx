import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dateTimestamp } from '../../domain/dates';
import { parseSearchParams } from '../../domain/searchParams';
import type { TransferOption, TransferQuery, TransferSearchResponse } from '../../domain/types';
import { apiClient } from '../../shared/api/client';
import { Button } from '../../shared/ui/Button';
import styles from './TransfersPage.module.css';

function readQuery(search: string): TransferQuery {
  const params = new URLSearchParams(search);
  const date = params.get('date') ?? '';
  const time = params.get('time') ?? '';
  const passengers = Number(params.get('passengers'));
  const query: TransferQuery = { from: params.get('from')?.trim().slice(0, 200) || 'Шереметьево', to: params.get('to')?.trim().slice(0, 200) || 'Москва', date: dateTimestamp(date) !== null ? date : parseSearchParams(new URLSearchParams()).checkIn, time: /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : '12:00', passengers: Number.isInteger(passengers) && passengers >= 1 && passengers <= 16 ? passengers : 2 };
  const returnDate = params.get('returnDate') ?? '';
  if (dateTimestamp(returnDate) !== null && returnDate >= query.date) query.returnDate = returnDate;
  return query;
}
export function TransfersPage() {
  const { search, key: locationKey } = useLocation();
  const key = `${locationKey}\n${search}`;
  const [result, setResult] = useState<{ key: string; data?: TransferSearchResponse; error?: boolean }>();
  const [sort, setSort] = useState('price-asc');
  const [selection, setSelection] = useState<{ key: string; option: TransferOption }>();
  const [confirmedKey, setConfirmedKey] = useState('');
  const [previousKey, setPreviousKey] = useState(key);
  if (previousKey !== key) {
    setPreviousKey(key);
    setResult(undefined);
    setSelection(undefined);
    setConfirmedKey('');
  }
  useEffect(() => {
    let active = true;
    apiClient.listTransfers(readQuery(search)).then(data => { if (active) setResult({ key, data }); }).catch(() => { if (active) setResult({ key, error: true }); });
    return () => { active = false; };
  }, [search, key]);
  const data = result?.key === key ? result.data : undefined;
  const editParams = data ? new URLSearchParams({ tab: 'transfers', from: data.query.from, to: data.query.to, date: data.query.date, time: data.query.time, passengers: String(data.query.passengers) }) : undefined;
  if (data?.query.returnDate) editParams?.set('returnDate', data.query.returnDate);
  const selected = selection?.key === key ? selection.option : undefined;
  const options = data ? [...data.transfers].sort((a, b) => sort === 'price-desc' ? b.price - a.price : a.price - b.price) : [];
  return <>
    <section className={styles.hero}><div className={styles.wrap}><h1>Трансферы</h1><p>Доедете с комфортом — мы обо всём позаботимся</p><div className={styles.tabs}><Link to="/">Отели и апартаменты</Link><span>Трансферы</span></div>{data && <div className={styles.route}><div><small>Маршрут</small><strong>{data.query.from} → {data.query.to}</strong></div><div><small>Поездка</small><strong>{data.query.date} · {data.query.time}{data.query.returnDate ? ` · обратно ${data.query.returnDate}` : ''}</strong></div><div><small>Пассажиры</small><strong>{data.query.passengers}</strong></div><Link to={`/?${editParams}`}>Изменить поиск</Link></div>}</div></section>
    <div className={styles.wrap}><div className={styles.heading}><div><h2>Выберите трансфер</h2><p>Демо-цена за машину в одну сторону</p></div>{data && <label>Сортировка <select aria-label="Сортировка" value={sort} onChange={event => setSort(event.target.value)}><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option></select></label>}</div>
      {result?.key !== key ? <p>Загружаем варианты…</p> : result.error ? <p role="alert">Не удалось загрузить трансферы. Попробуйте обновить страницу.</p> : options.length === 0 ? <p>Подходящих вариантов нет. Попробуйте изменить количество пассажиров.</p> : <ul className={styles.list} aria-label="Варианты трансфера">{options.map(option => <li key={option.id}><article className={styles.card}><div className={styles.car} aria-hidden="true">🚘</div><div className={styles.details}><h3>{option.category}</h3><p>{option.vehicle}</p><div className={styles.facts}><span>♙ До {option.passengers} пассажиров</span><span>▣ Багаж: {option.luggage} мест</span></div><p>Ожидание {option.waitingMinutes} мин · {option.amenities.join(' · ')}</p></div><div className={styles.price}><small>Цена за машину</small><strong>{option.price.toLocaleString('ru-RU')} ₽</strong><Button aria-label={`Выбрать ${option.category}`} onClick={() => { setSelection({ key, option }); setConfirmedKey(''); }}>Выбрать</Button></div></article></li>)}</ul>}
      {selected && <section className={styles.selection} aria-label="Выбранный трансфер"><div><h2>Ваш выбор: {selected.category}</h2><p>{selected.vehicle} · {selected.price.toLocaleString('ru-RU')} ₽</p><p>Демо: заказ не создаётся и оплата не производится.</p></div>{confirmedKey === `${key}\n${selected.id}` ? <p role="status">Демо-подтверждение готово. Заказ не создан.</p> : <Button size="large" onClick={() => setConfirmedKey(`${key}\n${selected.id}`)}>Подтвердить в демо</Button>}</section>}
    </div>
  </>;
}
