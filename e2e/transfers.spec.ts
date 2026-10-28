import { expect, test } from '@playwright/test';

test('selects and confirms a transfer locally', async ({ page }) => {
  const mutations: string[] = [];
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) mutations.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Трансферы', exact: true }).click();
  await page.getByLabel('Откуда').fill('Домодедово');
  await page.getByLabel('Куда', { exact: true }).fill('Тверь');
  await page.getByLabel('Дата поездки').fill('2027-06-15');
  await page.getByLabel('Время').fill('17:35');
  await page.getByLabel('Пассажиры').selectOption('5');
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await expect(page).toHaveURL(/\/transfers\?/);
  const params = new URL(page.url()).searchParams;
  expect(Object.fromEntries(params)).toEqual({ from: 'Домодедово', to: 'Тверь', date: '2027-06-15', time: '17:35', passengers: '5' });
  await expect(page.getByText('Домодедово → Тверь')).toBeVisible();
  await expect(page.getByText('2027-06-15 · 17:35')).toBeVisible();
  await expect(page.getByText('Пассажиры', { exact: true }).locator('..')).toContainText('5');
  const options = page.getByRole('list', { name: 'Варианты трансфера' });
  await expect(options.locator('li')).toHaveCount(3);
  await options.getByRole('button', { name: /^Выбрать / }).first().click();
  await page.getByRole('button', { name: 'Подтвердить в демо' }).click();
  await expect(page.getByRole('status')).toContainText('Заказ не создан');
  expect(mutations).toEqual([]);
});
