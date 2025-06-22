import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Utility: take screenshot and log URL + HTML
async function debugStep(page: Page, name: string) {
	await page.screenshot({ path: `${name}.png`, fullPage: true });
	const html = await page.content();
	console.log(`Current URL:`, await page.url());
	console.log(`HTML (${name}):`, html.slice(0, 1000));
}

test('Пользователь может зарегистрироваться, войти и создать объявление', async ({ page }) => {
	// Регистрация
	await page.goto('http://localhost:5173/register');
	await debugStep(page, 'register-page');
	const user = `testuser_${Date.now()}`;
	await page.locator('input[placeholder="test@example.com"]').fill(`${user}@example.com`);
	await page.locator('input[placeholder="username"]').fill(user);
	await page.locator('input[placeholder="••••••••"]').fill('password123');
	await debugStep(page, 'register-filled');
	await page.locator('button:has-text("Зарегистрироваться")').click();
	await page.waitForURL('http://localhost:5173/');
	await debugStep(page, 'after-register');

	// Создание объявления
	await page.goto('http://localhost:5173/ads/create');
	await debugStep(page, 'ad-create-page');
	const adTitle = `Test Ad ${Date.now()}`;
	await page.locator('input[placeholder="Введите заголовок"]').fill(adTitle);
	await page.locator('textarea[placeholder="Введите описание"]').fill('Описание для теста');
	await page.locator('input[placeholder="0"]').fill('123');
	await page.locator('input[placeholder="1"]').fill('1');
	await page.locator('select[aria-label="Тип оплаты"]').selectOption('once');
	await debugStep(page, 'ad-filled');
	await page.locator('button:has-text("Создать")').click();
	await expect(page.locator('.alert')).toBeVisible({ timeout: 5000 });
	await debugStep(page, 'after-alert');
	await page.waitForURL('http://localhost:5173/', { timeout: 5000 });
	await debugStep(page, 'after-redirect');
	await expect(page.locator(`text=${adTitle}`)).toBeVisible({ timeout: 5000 });
	await debugStep(page, 'ad-on-main');
});
