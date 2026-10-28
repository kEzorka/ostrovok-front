import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import styles from './layout.module.css';

const iconPaths = {
  heart: 'M12 21 3.5 12.6C-1 8 5.8 1 12 7c6.2-6 13 1 8.5 5.6Z',
  bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm5 3h4M12 2v2',
  help: 'M9.5 8a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 4v.1M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 22v-3a8 6 0 0 1 16 0v3',
  menu: 'M2 4h20M2 12h20M2 20h20',
};

function Icon({ name }: { name: keyof typeof iconPaths }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);

  return (
    <header className={styles.header}>
      <Link className={styles.logo} to="/" aria-label="Островок! — на главную">Островок!</Link>
      <nav className={styles.navigation} aria-label="Основная навигация">
        <Link className={`${styles.propertyLink} ${styles.desktopOnly}`} to="/info/property">Сдать жильё</Link>
        <Link className={styles.iconLink} to="/info/favorites" aria-label="Избранное"><Icon name="heart" /></Link>
        <Link className={`${styles.iconLink} ${styles.nonMobile}`} to="/info/notifications" aria-label="Уведомления"><Icon name="bell" /></Link>
        <Link className={`${styles.iconLink} ${styles.nonMobile}`} to="/info/language" aria-label="Язык: русский"><span className={styles.locale}>RU</span></Link>
        <Link className={`${styles.iconLink} ${styles.nonMobile}`} to="/info/currency" aria-label="Валюта: рубли"><span className={styles.currency}>₽</span></Link>
        <Link className={`${styles.iconLink} ${styles.nonMobile}`} to="/info/help" aria-label="Помощь"><Icon name="help" /></Link>
        <Link className={styles.profileLink} to="/info/profile" aria-label="Войти"><Icon name="profile" /><span className={styles.nonMobile}>Войти</span></Link>
        <Button
          ref={menuTrigger}
          className={styles.menuButton}
          variant="ghost"
          aria-label="Меню"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          onKeyDown={(event) => { if (event.key === 'Escape') setMenuOpen(false); }}
        ><Icon name="menu" /></Button>
      </nav>
      {menuOpen && (
        <nav className={styles.menu} id="site-menu" aria-label="Меню сервиса" onKeyDown={(event) => { if (event.key === 'Escape') { setMenuOpen(false); menuTrigger.current?.focus(); } }}>
          {[
            ['/', 'Отели и апартаменты'],
            ['/transfers', 'Трансферы'],
            ['/info/help', 'Поддержка'],
            ['/info/about', 'О сервисе'],
          ].map(([to, label]) => <Link key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</Link>)}
        </nav>
      )}
    </header>
  );
}
