import { test, expect } from '@playwright/test';

// Define a setup test that logs in and saves the state
test('authenticate', async ({ page }) => {
	await page.goto('/register');
	const user = `testuser_${Date.now()}`;
	await page.locator('input[type="email"]').fill(`${user}@example.com`);
	await page.locator('input[type="text"]').fill(user);
	await page.locator('input[type="password"]').fill('password123');
	await page.locator('button:has-text("Зарегистрироваться")').click();
	await page.waitForURL('/');
	await page.context().storageState({ path: 'storageState.json' });
});

test.describe('Ad Management Flow', () => {
	// This will make all tests in this describe block run after the 'authenticate' test,
	// and reuse the saved storage state.
	test.use({ storageState: 'storageState.json' });

	test('User can visit the main page while logged in', async ({ page }) => {
		await page.goto('/');

		// We know the user is logged in, so we should see the "Выйти" button
		await expect(page.locator('button:has-text("Выйти")')).toBeVisible();

		// The placeholder for the future ad creation test:
		/*
        const adTitle = `Test Ad ${Date.now()}`;
        await page.goto('/ads/create');
        await page.locator('input[name="title"]').fill(adTitle);
        ...
        await expect(page.locator(`div.card:has-text("${adTitle}")`)).toBeVisible();
        */
	});

	test('User can create an ad', async ({ page }) => {
		await page.goto('/ads/create');
		const adTitle = `Test Ad ${Date.now()}`;
		await page.locator('input[placeholder="Заголовок"]').fill(adTitle);
		await page.locator('textarea[placeholder="Описание"]').fill('Описание для теста');
		await page.locator('input[placeholder="Цена"]').fill('123');
		await page.locator('button:has-text("Создать")').click();
		await page.waitForSelector('text=Объявление создано');
	});
});
