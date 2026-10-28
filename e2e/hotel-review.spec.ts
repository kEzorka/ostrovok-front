import { test, expect } from '@playwright/test';

test('gallery fills its desktop mosaic and the page fits the viewport', async ({ page }, info) => {
  await page.goto('/hotel/city-grand?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=1&adults=2');
  const gallery = page.getByRole('region', { name: 'Фотографии отеля' });
  await expect(gallery).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (info.project.name !== 'mobile') {
    const galleryBox = (await gallery.boundingBox())!;
    const tiles = gallery.getByRole('button', { name: /Открыть фото \d/ });
    const boxes = await Promise.all((await tiles.all()).map(tile => tile.boundingBox()));
    expect(Math.max(...boxes.map(box => box!.y + box!.height))).toBeGreaterThanOrEqual(galleryBox.y + galleryBox.height - 1);
  } else {
    const opener = gallery.getByRole('button', { name: 'Открыть фотографии отеля' });
    await opener.click();
    await expect(page.getByRole('dialog', { name: /Фотографии/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
  }
});

test('mobile layout switches at 767 pixels', async ({ page }) => {
  for (const width of [768, 767]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/hotel/city-grand?destination=moscow&checkIn=2026-10-31&checkOut=2026-11-03&rooms=1&adults=2');
    await expect(page.getByRole('heading', { name: 'Сити Гранд' })).toBeVisible();
    const sticky = page.getByRole('link', { name: 'Выбрать номер', exact: true });
    if (width === 767) await expect(sticky).toBeVisible();
    else await expect(sticky).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
