import { expect, test } from '@playwright/test';

const query = '?destination=moscow&checkIn=2027-05-01&checkOut=2027-05-04&rooms=1&adults=2';

test('key screens fit the viewport and respect reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', `/search${query}`, `/hotel/city-grand${query}`, `/checkout/city-grand-rate-1${query}&hotel=city-grand`, '/transfers']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    if (path.startsWith('/checkout')) await expect(page.getByRole('heading', { name: 'Проверьте детали поездки' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    expect(await page.getByRole('button').first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('1e-05s');
  }
});

test('Escape from a menu link restores focus to the trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Меню' });
  await trigger.click();
  await page.getByRole('navigation', { name: 'Меню сервиса' }).getByRole('link').first().focus();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('odd secondary photo counts fill the desktop mosaic', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile', 'The mobile gallery displays one photo.');
  await page.route('**/api/hotels/city-grand', async route => {
    const response = await route.fetch();
    const body = await response.json();
    body.hotel.images = [...body.hotel.images, body.hotel.images[0]];
    await route.fulfill({ response, json: body });
  });
  await page.goto(`/hotel/city-grand${query}`);
  const gallery = page.getByRole('region', { name: 'Фотографии отеля' });
  const tiles = gallery.getByRole('button', { name: /Открыть фото \d/ });
  await expect(tiles).toHaveCount(3);
  const boxes = await Promise.all((await tiles.all()).map(tile => tile.boundingBox()));
  const galleryBox = (await gallery.boundingBox())!;
  const last = boxes[2]!;
  expect(last.x + last.width).toBeGreaterThanOrEqual(galleryBox.x + galleryBox.width - 1);
});
