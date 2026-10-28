import { test, expect } from '@playwright/test';

test('edit search fits inside its dialog at every viewport', async ({ page }) => {
  await page.goto('/search?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=1&adults=2');
  await page.getByRole('button', { name: /Москва.*2026/ }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Изменить поиск' });
  await expect(dialog).toBeVisible();
  const fits = await dialog.evaluate(element => element.scrollWidth <= element.clientWidth);
  expect(fits).toBe(true);
  for (const locator of [dialog.getByRole('combobox', { name: 'Направление' }), dialog.getByRole('button', { name: 'Найти' })]) {
    const control = await locator.boundingBox(); const bounds = await dialog.boundingBox();
    expect(control!.x).toBeGreaterThanOrEqual(bounds!.x);
    expect(control!.x + control!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
  }
});

test('map marker controls do not overlap', async ({ page }, testInfo) => {
  await page.goto('/search?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=1&adults=2');
  await page.getByRole('list', { name: 'Результаты поиска' }).waitFor();
  if (testInfo.project.name !== 'desktop') await page.getByRole('button', { name: 'На карте' }).click();
  const map = page.getByLabel('Карта отелей').filter({ visible: true }).first();
  const buttons = map.getByRole('button');
  const count = await buttons.count();
  expect(count).toBeGreaterThan(1);
  const boxes = await Promise.all((await buttons.all()).map(button => button.boundingBox()));
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i]!, b = boxes[j]!;
    expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
  }
});
