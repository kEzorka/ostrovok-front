import type { Amenity, Hotel, HotelType, MealPlan } from '../../src/domain/types';

interface HotelSeed {
  slug: string; name: string; destinationId: string; type: HotelType; stars: number;
  rating: number; distance: number; price: number; image: string; amenities: Amenity[];
}
const seeds: HotelSeed[] = [
  { slug: 'city-grand', name: 'Сити Гранд', destinationId: 'moscow', type: 'hotel', stars: 5, rating: 9.4, distance: 0.8, price: 12800, image: 'city-grand', amenities: ['wifi', 'parking', 'pool', 'spa', 'fitness', 'air-conditioning'] },
  { slug: 'river-view', name: 'Речной вид', destinationId: 'moscow', type: 'hotel', stars: 4, rating: 8.9, distance: 2.1, price: 7400, image: 'river-view', amenities: ['wifi', 'parking', 'fitness', 'pets', 'air-conditioning'] },
  { slug: 'garden-house', name: 'Садовый дом', destinationId: 'moscow', type: 'guesthouse', stars: 3, rating: 9.1, distance: 4.2, price: 4200, image: 'garden-house', amenities: ['wifi', 'parking', 'pets'] },
  { slug: 'modern-loft', name: 'Современный лофт', destinationId: 'moscow', type: 'apartment', stars: 0, rating: 9.2, distance: 1.5, price: 5900, image: 'modern-loft', amenities: ['wifi', 'kitchen', 'air-conditioning'] },
  { slug: 'atrium', name: 'Атриум', destinationId: 'moscow', type: 'hotel', stars: 4, rating: 8.7, distance: 3.4, price: 6300, image: 'atrium', amenities: ['wifi', 'parking', 'pool', 'fitness'] },
  { slug: 'classic-suite', name: 'Классик Сьют', destinationId: 'moscow', type: 'hotel', stars: 5, rating: 9.6, distance: 0.4, price: 15900, image: 'classic-suite', amenities: ['wifi', 'parking', 'pool', 'spa', 'air-conditioning'] },
  { slug: 'central-studio', name: 'Студия в центре', destinationId: 'moscow', type: 'apartment', stars: 0, rating: 8.5, distance: 1.2, price: 3500, image: 'modern-loft', amenities: ['wifi', 'kitchen', 'pets'] },
  { slug: 'green-courtyard', name: 'Зелёный двор', destinationId: 'moscow', type: 'guesthouse', stars: 2, rating: 8.2, distance: 6.8, price: 2700, image: 'garden-house', amenities: ['wifi', 'parking', 'kitchen'] },
  { slug: 'city-hostel', name: 'Городской хостел', destinationId: 'moscow', type: 'hostel', stars: 0, rating: 7.9, distance: 2.6, price: 1600, image: 'atrium', amenities: ['wifi', 'kitchen'] },
  { slug: 'panorama-apartments', name: 'Апартаменты Панорама', destinationId: 'moscow', type: 'apartment', stars: 0, rating: 9.3, distance: 5.1, price: 8100, image: 'river-view', amenities: ['wifi', 'parking', 'kitchen', 'fitness', 'air-conditioning'] },
  { slug: 'station-comfort', name: 'Вокзал Комфорт', destinationId: 'moscow', type: 'hotel', stars: 3, rating: 8.0, distance: 4.7, price: 3100, image: 'city-grand', amenities: ['wifi', 'parking', 'air-conditioning'] },
  { slug: 'quiet-lane', name: 'Тихий переулок', destinationId: 'moscow', type: 'hotel', stars: 2, rating: 7.4, distance: 8.3, price: 2300, image: 'classic-suite', amenities: ['wifi', 'pets'] },
  { slug: 'neva-grand', name: 'Невский Гранд', destinationId: 'saint-petersburg', type: 'hotel', stars: 4, rating: 9.1, distance: 0.7, price: 6900, image: 'city-grand', amenities: ['wifi', 'parking', 'fitness'] },
  { slug: 'canal-loft', name: 'Лофт у канала', destinationId: 'saint-petersburg', type: 'apartment', stars: 0, rating: 8.8, distance: 1.3, price: 4500, image: 'modern-loft', amenities: ['wifi', 'kitchen', 'pets'] },
  { slug: 'northern-garden', name: 'Северный сад', destinationId: 'saint-petersburg', type: 'guesthouse', stars: 3, rating: 8.4, distance: 3.8, price: 3400, image: 'garden-house', amenities: ['wifi', 'parking'] },
  { slug: 'sea-breeze', name: 'Морской бриз', destinationId: 'sochi', type: 'hotel', stars: 4, rating: 8.9, distance: 1.1, price: 7200, image: 'river-view', amenities: ['wifi', 'pool', 'spa', 'air-conditioning'] },
  { slug: 'sunny-studio', name: 'Солнечная студия', destinationId: 'sochi', type: 'apartment', stars: 0, rating: 8.6, distance: 2.4, price: 3800, image: 'atrium', amenities: ['wifi', 'kitchen', 'air-conditioning'] },
  { slug: 'kazan-courtyard', name: 'Казанский двор', destinationId: 'kazan', type: 'hotel', stars: 3, rating: 9.0, distance: 0.9, price: 4100, image: 'classic-suite', amenities: ['wifi', 'parking', 'pets'] },
];
const cities = {
  moscow: { name: 'Москва', lat: 55.7539, lng: 37.6208 },
  'saint-petersburg': { name: 'Санкт-Петербург', lat: 59.9343, lng: 30.3351 },
  sochi: { name: 'Сочи', lat: 43.5855, lng: 39.7231 },
  kazan: { name: 'Казань', lat: 55.7963, lng: 49.1088 },
};

/** Fictional catalog. No production hotel data, prices, reviews or assets. */
export const hotels: Hotel[] = seeds.map((seed, index) => {
  const city = cities[seed.destinationId as keyof typeof cities];
  const meals: MealPlan[] = seed.type === 'apartment' || seed.type === 'hostel'
    ? ['none', 'none', 'breakfast'] : ['none', 'breakfast', index % 2 ? 'half-board' : 'full-board'];
  return {
    id: seed.slug, slug: seed.slug, name: seed.name, destinationId: seed.destinationId,
    type: seed.type, stars: seed.stars, rating: seed.rating, reviewCount: 82 + index * 37,
    popularity: 100 - index * 3,
    address: `${city.name}, Демонстрационная улица, ${index + 1}`,
    distanceFromCenter: seed.distance,
    coordinates: { lat: city.lat + (index % 3 - 1) * 0.014, lng: city.lng + (index % 5 - 2) * 0.012 },
    images: [seed.image, seeds[(index + 1) % 6].image, seeds[(index + 2) % 6].image].map(image => `/api/assets/hotels/${image}.webp`),
    description: `${seed.name} — вымышленный объект для демонстрации поиска и бронирования. Уютные номера, удобное расположение и всё необходимое для отдыха и деловой поездки. Изображения — иллюстрации проекта.`,
    amenities: seed.amenities, checkInTime: '14:00', checkOutTime: '12:00',
    rates: meals.map((meal, rateIndex) => ({
      id: `${seed.slug}-rate-${rateIndex + 1}`,
      roomName: ['Стандартный номер', 'Улучшенный номер', 'Семейный номер'][rateIndex],
      bedType: seed.type === 'hostel' ? 'bunk' as const : rateIndex === 1 ? 'twin' as const : 'double' as const,
      nightlyPrice: seed.price + rateIndex * 1200,
      ...(rateIndex === 0 ? { originalNightlyPrice: seed.price + 900 } : {}),
      meal, freeCancellation: rateIndex !== 0, payment: rateIndex === 0 ? 'now' as const : 'at-hotel' as const,
      availableRooms: [4, 3, 2][rateIndex], maxGuests: [2, 3, 4][rateIndex],
    })),
    reviews: [
      { id: `${seed.slug}-review-1`, author: 'Демо-гость', date: '2026-09-15', rating: seed.rating, text: 'Пример отзыва: удобное расположение, внимательный персонал и чистый номер.' },
      { id: `${seed.slug}-review-2`, author: 'Демо-путешественник', date: '2026-10-03', rating: 8.5, text: 'Пример отзыва: всё необходимое для короткой поездки. Это демонстрационный отзыв.' },
    ],
  };
});
