import { expect, test } from '@playwright/test';

test('guest controls stay open when a counter reaches its minimum', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /2 гостя/ }).click();
  await page.getByRole('button', { name: 'Убрать взрослого' }).click();
  await expect(page.getByRole('dialog', { name: 'Гости и номера' })).toBeVisible();
  await page.getByRole('button', { name: 'Готово' }).click();
});

test('searches Moscow and confirms a hotel locally', async ({ page }, info) => {
  const mutations: string[] = [];
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) mutations.push(request.url()); });
  await page.goto('/');
  const destination = page.getByRole('combobox', { name: 'Направление' });
  await destination.fill('Москва');
  await page.getByRole('option', { name: 'Москва, Россия' }).click();
  await page.getByLabel('Заезд').fill('2027-05-01');
  await page.getByLabel('Выезд').fill('2027-05-04');
  await page.getByRole('button', { name: /2 гостя/ }).click();
  await page.getByRole('button', { name: 'Добавить взрослого' }).click();
  await page.getByRole('button', { name: 'Добавить номер' }).click();
  await page.getByRole('button', { name: 'Готово' }).click();
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await expect(page).toHaveURL(/\/search\?/);
  const params = new URL(page.url()).searchParams;
  expect([params.get('destination'), params.get('checkIn'), params.get('checkOut'), params.get('adults'), params.get('rooms')]).toEqual(['moscow', '2027-05-01', '2027-05-04', '3', '2']);
  await expect(page.getByRole('list', { name: 'Результаты поиска' })).toBeVisible();
  const card = page.getByRole('article').filter({ has: page.getByRole('link', { name: 'Сити Гранд', exact: true }) });
  await expect(card).toContainText(/76\s*800 ₽/);
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Фильтры', exact: true }).click();
  await page.getByLabel('Бесплатная отмена').filter({ visible: true }).check();
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Показать варианты' }).click();
  await expect(card).toContainText(/84\s*000 ₽/);
  await page.getByRole('list', { name: 'Результаты поиска' }).getByRole('link').first().click();
  await expect(page).toHaveURL(/\/hotel\//);
  await page.getByRole('link', { name: /Выбрать .+/ }).first().click();
  await expect(page).toHaveURL(/\/checkout\//);
  await expect(page.getByText(/Демо: это не бронирование/)).toBeVisible();
  await expect(page.locator('input, textarea')).toHaveCount(0);
  await page.getByRole('button', { name: 'Подтвердить в демо' }).click();
  await expect(page.getByRole('status')).toContainText('Бронирование не создано');
  expect(mutations).toEqual([]);
});
