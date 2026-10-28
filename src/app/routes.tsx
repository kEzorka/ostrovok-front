import { Link, useParams } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { App } from './App';
import { HomePage } from '../features/home/HomePage';
import { SearchPage } from '../features/search/SearchPage';
import { HotelPage } from '../features/hotel/HotelPage';
import { CheckoutPage } from '../features/checkout/CheckoutPage';
import { TransfersPage } from '../features/transfers/TransfersPage';

const informationTitles: Record<string, string> = {
  favorites: 'Избранное',
  notifications: 'Уведомления',
  help: 'Помощь',
  profile: 'Войти',
  property: 'Сдать жильё',
  language: 'Язык',
  currency: 'Валюта',
  about: 'О сервисе',
  contacts: 'Контакты',
  partners: 'Партнёрам',
  privacy: 'Конфиденциальность',
  terms: 'Условия использования',
};

function PlaceholderPage({ title, home = false }: { title: string; home?: boolean }) {
  return (
    <section className={home ? 'placeholder-page placeholder-page--home' : 'placeholder-page'}>
      <div className="container">
        <h1>{title}</h1>
        <p>Локальная демонстрация сервиса путешествий.</p>
        {!home && <Link to="/">На главную</Link>}
      </div>
    </section>
  );
}

function InformationPage() {
  const { topic } = useParams();
  return <PlaceholderPage title={informationTitles[topic ?? ''] ?? 'Информация'} />;
}

export const appRoutes: RouteObject[] = [
  {
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'hotel/:slug', element: <HotelPage /> },
      { path: 'checkout/:rateId', element: <CheckoutPage /> },
      { path: 'transfers', element: <TransfersPage /> },
      { path: 'info/:topic', element: <InformationPage /> },
      { path: '*', element: <PlaceholderPage title="Страница не найдена" /> },
    ],
  },
];
