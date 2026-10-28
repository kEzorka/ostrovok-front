import { expect, test } from '@playwright/test';

test('selects and confirms a transfer locally', async ({ page }) => {
  const mutations: string[] = [];
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) mutations.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Трансферы', exact: true }).click();
  await page.getByLabel('Откуда').fill('Шереметьево');
  await page.getByLabel('Куда', { exact: true }).fill('Москва');
  await page.getByLabel('Дата поездки').fill('2027-05-01');
  await page.getByLabel('Пассажиры').selectOption('2');
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await expect(page).toHaveURL(/\/transfers\?/);
  const options = page.getByRole('list', { name: 'Варианты трансфера' });
  await expect(options.locator('li')).toHaveCount(6);
  await options.getByRole('button', { name: /^Выбрать / }).first().click();
  await page.getByRole('button', { name: 'Подтвердить в демо' }).click();
  await expect(page.getByRole('status')).toContainText('Заказ не создан');
  expect(mutations).toEqual([]);
});
