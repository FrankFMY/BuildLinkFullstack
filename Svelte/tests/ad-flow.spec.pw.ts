import { test, expect } from '@playwright/test';

test('Пользователь может зарегистрироваться, войти и создать объявление', async ({ page }) => {
	// Регистрация
	await page.goto('/register');
	const user = `testuser_${Date.now()}`;
	const email = `${user}@example.com`;
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Имя пользователя').fill(user);
	await page.getByLabel('Телефон').fill('+7999' + Math.floor(1000000 + Math.random() * 9000000));
	await page.getByLabel('Пароль').fill('password123');
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
	await page.waitForURL('/');

	// Создание объявления
	await page.goto('/ads/create');
	const adTitle = `Test Ad ${Date.now()}`;
	await page.getByLabel('Заголовок').fill(adTitle);
	await page.getByLabel('Описание').fill('Описание для теста');
	await page.getByLabel('Цена').fill('123');
	await page.getByRole('button', { name: 'Создать' }).click();

	// Ожидаем алерт об успехе и редирект на главную
	await expect(page.locator('.alert.variant-filled-success')).toBeVisible();
	await page.waitForURL('/');

	await expect(
		page.getByRole('heading', { name: 'BuildLink — маркетплейс объявлений' })
	).toBeVisible();
	await expect(page.locator(`div:has-text("${adTitle}")`)).toBeVisible();
});

test('валидация формы создания объявления', async ({ page }) => {
	// Сначала нужно зарегистрироваться и войти
	await page.goto('/register');
	const user = `testuser_${Date.now()}`;
	const email = `${user}@example.com`;
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Имя пользователя').fill(user);
	await page.getByLabel('Телефон').fill('+7999' + Math.floor(1000000 + Math.random() * 9000000));
	await page.getByLabel('Пароль').fill('password123');
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
	await page.waitForURL('/');

	await page.goto('/ads/create');

	const createButton = page.getByRole('button', { name: 'Создать' });

	// Пустой заголовок
	await createButton.click();
	await expect(page.locator('.alert')).toBeVisible();

	// Слишком длинное описание
	await page.getByLabel('Заголовок').fill('Тест');
	await page.getByLabel('Описание').fill('a'.repeat(2001));
	await createButton.click();
	await expect(page.locator('.alert')).toBeVisible();

	// Невалидная цена
	await page.getByLabel('Описание').fill('Описание');
	await page.getByLabel('Цена').fill('-100');
	await createButton.click();
	await expect(page.locator('.alert')).toBeVisible();

	// XSS в заголовке
	await page.getByLabel('Заголовок').fill('<script>alert(1)</script>');
	await page.getByLabel('Цена').fill('100');
	await createButton.click();
	await expect(page.locator('.alert')).toBeVisible();
});
