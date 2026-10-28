import { useState } from 'react';
import type { Hotel } from '../../domain/types';
import { Modal } from '../../shared/ui/Modal';
import styles from './HotelPage.module.css';

export function HotelGallery({ hotel }: { hotel: Hotel }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const images = hotel.images;
  const move = (delta: number) => setIndex(current => (current + delta + images.length) % images.length);
  if (!images.length) return <div className={styles.noPhoto}>Фотографии пока не добавлены</div>;
  return <section aria-label="Фотографии отеля" className={styles.gallery}>
    <div className={styles.mainPhoto}><img src={images[index]} alt={`Фото ${index + 1} — ${hotel.name}`} /><button className={styles.previous} aria-label="Предыдущее фото" onClick={() => move(-1)}>‹</button><button className={styles.next} aria-label="Следующее фото" onClick={() => move(1)}>›</button><span className={styles.counter}>{index + 1} / {images.length}</span></div>
    <div className={styles.tiles}>{images.slice(1).map((image, i) => <button key={`${image}-${i}`} onClick={() => { setIndex(i + 1); setOpen(true); }} aria-label={`Открыть фото ${i + 2}`}><img src={image} alt="" /></button>)}<button className={styles.allPhotos} onClick={() => setOpen(true)}>Все фотографии · {images.length}</button></div>
    <Modal open={open} title={`Фотографии — ${hotel.name}`} onClose={() => setOpen(false)}><div className={styles.modalPhoto}><img src={images[index]} alt={`Фото ${index + 1} — ${hotel.name}`} /><div><button onClick={() => move(-1)}>← Предыдущее</button><span>{index + 1} / {images.length}</span><button onClick={() => move(1)}>Следующее →</button></div></div></Modal>
  </section>;
}
