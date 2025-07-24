import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/BuildLink/);
});

test('successful registration and login flow', async ({ page }) => {
	const uniqueUser = `testuser_${Date.now()}`;
	const password = 'password123';
	const email = `${uniqueUser}@example.com`;
	// Go to registration page
	await page.goto('/register');

	// Fill out the form
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Имя пользователя').fill(uniqueUser);
	await page.getByLabel('Пароль').fill(password);
	await page.getByLabel('Телефон').fill('+7999' + Math.floor(1000000 + Math.random() * 9000000));

	// Click register button
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

	// After registration, user should be redirected to home and see the logout button
	await page.waitForURL('/');
	await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();

	// Click logout
	await page.getByRole('button', { name: 'Выйти' }).click();

	// User should be back to seeing Login and Register buttons
	await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Регистрация' })).toBeVisible();

	// Go to login page
	await page.goto('/login');

	// Fill out the login form
	await page.getByLabel('Имя пользователя или Email').fill(uniqueUser);
	await page.getByLabel('Пароль').fill(password);

	// Click login button
	await page.getByRole('button', { name: 'Войти' }).click();

	// After login, user should be redirected to home and see the logout button
	await page.waitForURL('/');
	await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
});

test('registration validation errors', async ({ page }) => {
	await page.goto('/register');

	// Пустые поля
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
	await expect(page.locator('.alert')).toBeVisible();

	// Короткий пароль
	await page.getByLabel('Email').fill('user@mail.com');
	await page.getByLabel('Имя пользователя').fill('user');
	await page.getByLabel('Пароль').fill('123');
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
	await expect(page.locator('.alert')).toBeVisible();

	// XSS в username
	await page.getByLabel('Имя пользователя').fill('<script>alert(1)</script>');
	await page.getByLabel('Пароль').fill('password123');
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
	await expect(page.locator('.alert')).toBeVisible();

	// Повторная регистрация
	const uniqueUser = `testuser_${Date.now()}`;
	const email = `${uniqueUser}@example.com`;
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Имя пользователя').fill(uniqueUser);
	await page.getByLabel('Пароль').fill('password123');
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
	await page.waitForURL('/'); // Первая регистрация успешна
	await page.goto('/register');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Имя пользователя').fill(uniqueUser);
	await page.getByLabel('Пароль').fill('password123');
	await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
	await expect(page.locator('.alert')).toBeVisible();
});
