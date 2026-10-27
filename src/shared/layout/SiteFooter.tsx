import { Link } from 'react-router-dom';
import styles from './layout.module.css';

const footerGroups = [
  { title: 'Островок', links: [['about', 'О компании'], ['contacts', 'Контакты'], ['help', 'Помощь']] },
  { title: 'Путешественникам', links: [['favorites', 'Избранное'], ['help', 'Поддержка'], ['terms', 'Условия использования']] },
  { title: 'Партнёрам', links: [['property', 'Сдать жильё'], ['partners', 'Партнёрская программа']] },
  { title: 'Полезное', links: [['privacy', 'Конфиденциальность'], ['language', 'Язык и регион']] },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <nav className={styles.footerGrid} aria-label="Информация о сервисе">
          {footerGroups.map(({ title, links }) => (
            <div key={title}>
              <h2 className={styles.footerTitle}>{title}</h2>
              <ul className={styles.footerLinks}>
                {links.map(([topic, label]) => <li key={topic}><Link to={`/info/${topic}`}>{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </nav>
        <div className={styles.footerBottom}>
          <span>Островок! · Локальное демо</span>
          <span>Демо: бронирование не создаётся</span>
        </div>
      </div>
    </footer>
  );
}
