import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
	await page.goto('/');

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/BuildLink/);
});

test('successful registration and login flow', async ({ page }) => {
	const uniqueUser = `testuser_${Date.now()}`;
	const password = 'password123';

	// Go to registration page
	await page.goto('/register');

	// Fill out the form
	await page.locator('input[type="email"]').fill(`${uniqueUser}@example.com`);
	await page.locator('input[type="text"]').fill(uniqueUser);
	await page.locator('input[type="password"]').fill(password);

	// Click register button
	await page.locator('button:has-text("Зарегистрироваться")').click();

	// After registration, user should be redirected to home and see the logout button
	await page.waitForURL('/');
	await expect(page.locator('button:has-text("Выйти")')).toBeVisible();

	// Click logout
	await page.locator('button:has-text("Выйти")').click();

	// User should be back to seeing Login and Register buttons
	await expect(page.locator('a:has-text("Войти")')).toBeVisible();
	await expect(page.locator('a:has-text("Регистрация")')).toBeVisible();

	// Go to login page
	await page.goto('/login');

	// Fill out the login form
	await page.locator('input[type="text"]').fill(uniqueUser);
	await page.locator('input[type="password"]').fill(password);

	// Click login button
	await page.locator('button:has-text("Войти")').click();

	// After login, user should be redirected to home and see the logout button
	await page.waitForURL('/');
	await expect(page.locator('button:has-text("Выйти")')).toBeVisible();
});
