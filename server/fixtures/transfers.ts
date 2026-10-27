import type { TransferOption } from '../../src/domain/types';

/** Fictional cars and fixed one-way demo prices in RUB. */
export const transfers: TransferOption[] = [
  { id: 'economy', category: 'Эконом', vehicle: 'Компактный седан или аналог', passengers: 3, luggage: 2, waitingMinutes: 60, price: 1900, amenities: ['Кондиционер', 'Встреча с табличкой'] },
  { id: 'comfort', category: 'Комфорт', vehicle: 'Седан комфорт-класса или аналог', passengers: 3, luggage: 3, waitingMinutes: 60, price: 2700, amenities: ['Кондиционер', 'Вода', 'Встреча с табличкой'] },
  { id: 'business', category: 'Бизнес', vehicle: 'Бизнес-седан или аналог', passengers: 3, luggage: 3, waitingMinutes: 90, price: 4500, amenities: ['Кондиционер', 'Вода', 'Wi-Fi'] },
  { id: 'minivan', category: 'Минивэн', vehicle: 'Семейный минивэн или аналог', passengers: 6, luggage: 6, waitingMinutes: 60, price: 3900, amenities: ['Кондиционер', 'Детское кресло по запросу'] },
  { id: 'premium-van', category: 'Премиум-минивэн', vehicle: 'Премиум-минивэн или аналог', passengers: 7, luggage: 7, waitingMinutes: 90, price: 6200, amenities: ['Кондиционер', 'Вода', 'Wi-Fi'] },
  { id: 'minibus', category: 'Микроавтобус', vehicle: 'Туристический микроавтобус или аналог', passengers: 16, luggage: 16, waitingMinutes: 60, price: 7900, amenities: ['Кондиционер', 'Багажное отделение'] },
];
