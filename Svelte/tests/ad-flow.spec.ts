import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Utility: take screenshot and log URL + HTML
async function debugStep(page: Page, name: string) {
	await page.screenshot({ path: `playwright-report/${name}.png`, fullPage: true });
}

test('Пользователь может зарегистрироваться, войти и создать объявление', async ({ page }) => {
	// Регистрация
	await page.goto('/register');
	const user = `testuser_${Date.now()}`;
	await page.getByLabel('Email').fill(`${user}@example.com`);
	await page.getByLabel('Имя пользователя').fill(user);
	await page.getByLabel('Телефон').fill('+7999' + Math.floor(1000000 + Math.random() * 9000000));
	await page.getByLabel('Пароль').fill('password123');
	await debugStep(page, 'register-filled');

	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

	// Ожидаем перехода на главную и появления приветствия
	await expect(page.getByRole('heading', { name: 'Объявления' })).toBeVisible({ timeout: 10000 });
	await expect(page.getByText(`Привет, ${user}`)).toBeVisible();
	await debugStep(page, 'after-register');

	// Создание объявления
	await page.goto('/ads/create');
	const adTitle = `Test Ad ${Date.now()}`;
	await page.getByLabel('Заголовок').fill(adTitle);
	await page.getByLabel('Описание').fill('Описание для теста');
	await page.getByLabel('Цена').fill('123');
	await page.getByLabel('Количество').fill('1');
	await page.getByLabel('Тип оплаты').selectOption({ label: 'Разово' });
	await debugStep(page, 'ad-filled');

	await page.getByRole('button', { name: 'Создать' }).click();

	// Ожидаем алерт об успехе и редирект на главную
	await expect(page.locator('.alert.variant-filled-success')).toBeVisible({ timeout: 5000 });
	await debugStep(page, 'after-alert');

	await expect(page.getByRole('heading', { name: 'Объявления' })).toBeVisible({ timeout: 10000 });
	await expect(page.locator(`article:has-text("${adTitle}")`)).toBeVisible();
	await debugStep(page, 'ad-on-main');
});

test('валидация формы создания объявления', async ({ page }) => {
	// Предполагается, что пользователь уже зарегистрирован и залогинен
	await page.goto('http://localhost:5173/ads/create');

	// Пустой заголовок
	await page.locator('button:has-text("Создать")').click();
	await expect(page.locator('.alert')).toBeVisible();

	// Слишком длинное описание
	await page.locator('input[placeholder="Введите заголовок"]').fill('Тест');
	await page.locator('textarea[placeholder="Введите описание"]').fill('a'.repeat(2000));
	await page.locator('button:has-text("Создать")').click();
	await expect(page.locator('.alert')).toBeVisible();

	// Невалидная цена
	await page.locator('textarea[placeholder="Введите описание"]').fill('Описание');
	await page.locator('input[placeholder="0"]').fill('-100');
	await page.locator('button:has-text("Создать")').click();
	await expect(page.locator('.alert')).toBeVisible();

	// XSS в заголовке
	await page.locator('input[placeholder="Введите заголовок"]').fill('<script>alert(1)</script>');
	await page.locator('input[placeholder="0"]').fill('100');
	await page.locator('button:has-text("Создать")').click();
	await expect(page.locator('.alert')).toBeVisible();

	// TODO: Превышение лимита фото (если реализовано на фронте)
});
