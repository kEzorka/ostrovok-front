import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseSearchParams, serializeSearchState } from '../../domain/searchParams';
import { HotelSearchForm } from '../search-form/HotelSearchForm';
import { TransferSearchForm } from '../search-form/TransferSearchForm';
import styles from './HomePage.module.css';

export function HomePage() {
  const { search } = useLocation();
  const [tab, setTab] = useState<'hotels' | 'transfers'>(() => new URLSearchParams(search).get('tab') === 'transfers' ? 'transfers' : 'hotels');
  const [message, setMessage] = useState(false);
  const navigate = useNavigate();
  return <>
    <section className={styles.hero}><div className="container"><h1>Отели и апартаменты</h1><p className={styles.tagline}>Оооочень много отелей и апартаментов!</p><div className={styles.tabs} role="group" aria-label="Поиск"><button type="button" aria-pressed={tab === 'hotels'} onClick={() => setTab('hotels')}>Отели и апартаменты</button><button type="button" aria-pressed={tab === 'transfers'} onClick={() => setTab('transfers')}>Трансферы</button><a href="/info/partners" onFocus={event => event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}>Для командировок ↗</a></div>
      {tab === 'hotels' ? <HotelSearchForm initialState={parseSearchParams(new URLSearchParams())} onSubmit={state => navigate(`/search?${serializeSearchState(state)}`)} /> : <TransferSearchForm onSubmit={query => { const params = new URLSearchParams({ from: query.from, to: query.to, date: query.date, time: query.time, passengers: String(query.passengers) }); if (query.returnDate) params.set('returnDate', query.returnDate); navigate(`/transfers?${params}`); }} />}
    </div></section>
    <div className={`container ${styles.content}`}><section className={styles.promo}><div className={styles.promoArt} aria-hidden="true">✦</div><div><h2>Путешествуйте выгоднее!</h2><p>Бронируйте отели и апартаменты для любых поездок.</p></div></section>
      <section className={styles.benefits}><h2>Путешествуйте с Островком</h2><div className={styles.benefitGrid}><article><span>✦</span><h3>Большой выбор</h3><p>Отели и апартаменты по всему миру</p></article><article><span>♡</span><h3>Выгодные цены</h3><p>Находите подходящие варианты для каждой поездки</p></article><article><span>☺</span><h3>Мы всегда рядом</h3><p>Поддержка на каждом этапе путешествия</p></article></div></section>
      <section className={styles.app}><div><h2>Путешествуйте с приложением Островок</h2><p>Все бронирования и лучшие предложения под рукой.</p></div><div className={styles.phone} aria-hidden="true">О!</div></section>
      <section className={styles.subscribe}><h2>Вдохновение для путешествий</h2><p>Узнавайте об интересных направлениях и предложениях.</p><button type="button" onClick={() => setMessage(true)}>Подписаться</button>{message && <p role="status">Подписка недоступна в демо-версии.</p>}</section>
    </div>
  </>;
}
