import { test, expect } from '@playwright/test';

test('отображение профиля и объявлений', async ({ page }) => {
	// Логинимся
	await page.goto('/login');
	await page.getByLabel('Имя пользователя или Email').fill('AkiraFCK');
	await page.getByLabel('Пароль').fill('123123');
	await page.getByRole('button', { name: 'Войти' }).click();
	await page.waitForURL('/');
	// Переходим в профиль
	await page.goto('/profile');
	await expect(page.locator('h2')).toBeVisible();
	await expect(page.locator('.ads-grid')).toBeVisible();
});

test('смена аватара (UI)', async ({ page }) => {
	// Логинимся
	await page.goto('/login');
	await page.getByLabel('Имя пользователя или Email').fill('AkiraFCK');
	await page.getByLabel('Пароль').fill('123123');
	await page.getByRole('button', { name: 'Войти' }).click();
	await page.waitForURL('/');
	// Переходим в профиль
	await page.goto('/profile');
	await page.setInputFiles('input[type=file]', {
		name: 'avatar.png',
		mimeType: 'image/png',
		buffer: Buffer.from('avatar')
	});
	await expect(page.locator('.success-msg')).toBeVisible();
});

test('переход в настройки', async ({ page }) => {
	// Логинимся
	await page.goto('/login');
	await page.getByLabel('Имя пользователя или Email').fill('AkiraFCK');
	await page.getByLabel('Пароль').fill('123123');
	await page.getByRole('button', { name: 'Войти' }).click();
	await page.waitForURL('/');
	// Переходим в профиль
	await page.goto('/profile');
	await page.locator('button:has-text("Настройки")').click();
	await expect(page).toHaveURL(/\/profile\/settings/);
});

// Для проверки ошибок можно замокать api.get или использовать некорректный токен
