import { test, expect } from '@playwright/test';

test('отображение профиля и объявлений', async ({ page }) => {
	// Предполагается, что пользователь уже зарегистрирован и залогинен
	await page.goto('/profile');
	await expect(page.locator('h2')).toBeVisible();
	await expect(page.locator('.ads-list')).toBeVisible();
});

test('смена аватара (UI)', async ({ page }) => {
	await page.goto('/profile');
	const uploader = page.locator('input[type="file"]');
	await uploader.setInputFiles({
		name: 'avatar.png',
		mimeType: 'image/png',
		buffer: Buffer.from('avatar')
	});
	await expect(page.locator('.success-msg')).toBeVisible();
});

test('переход в настройки', async ({ page }) => {
	await page.goto('/profile');
	await page.locator('button:has-text("Настройки")').click();
	await expect(page).toHaveURL(/\/profile\/settings/);
});

// Для проверки ошибок можно замокать api.get или использовать некорректный токен
