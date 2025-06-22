import { test, expect } from '@playwright/test';

test('Sanity: open main page and see title', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page).toHaveTitle(/BuildLink/i);
  await page.screenshot({ path: 'sanity.png', fullPage: true });
}); 