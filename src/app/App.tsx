import { Outlet } from 'react-router-dom';
import { SiteHeader } from '../shared/layout/SiteHeader';
import { SiteFooter } from '../shared/layout/SiteFooter';

export function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Перейти к содержимому</a>
      <SiteHeader />
      <main id="main-content"><Outlet /></main>
      <SiteFooter />
    </div>
  );
}
