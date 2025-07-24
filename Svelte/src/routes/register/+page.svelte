<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { authToken, user as userStore } from '$lib/stores/auth';

	let email = '';
	let username = '';
	let password = '';
	let phone = '';
	let error = '';
	let loading = false;

	async function handleRegister() {
		if (!email || !username || !password || !phone) {
			error = 'Все поля обязательны для заполнения';
			return;
		}
		error = '';
		loading = true;
		try {
			await api.post('/api/auth/register', { email, username, password, phone });

			// Automatically log in after registration
			const tokenResponse = await api.post('/api/auth/login', { username, password });
			authToken.set(tokenResponse.access_token);

			const userProfile = await api.get('/api/auth/me');
			userStore.set(userProfile);

			await goto('/');
		} catch (e: unknown) {
			error =
				(e as { data?: { message?: string } })?.data?.message || 'Произошла ошибка при регистрации';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto flex h-full items-center justify-center">
	<div class="card p-4 md:p-8 space-y-4 w-full max-w-md">
		<h2 class="h2 text-center">Регистрация</h2>

		<label class="label">
			<span class="label-text">Email</span>
			<input
				class="input"
				type="email"
				bind:value={email}
				placeholder="test@example.com"
				required
			/>
		</label>
		<label class="label">
			<span class="label-text">Имя пользователя</span>
			<input class="input" type="text" bind:value={username} placeholder="username" required />
		</label>
		<label class="label">
			<span class="label-text">Телефон</span>
			<input class="input" type="tel" bind:value={phone} placeholder="+79991234567" required />
		</label>
		<label class="label">
			<span class="label-text">Пароль</span>
			<input class="input" type="password" bind:value={password} placeholder="••••••••" required />
		</label>

		{#if error}
			<div class="alert variant-filled-error">{error}</div>
		{/if}

		<button class="btn variant-filled-primary w-full" on:click={handleRegister} disabled={loading}>
			{loading ? 'Загрузка...' : 'Зарегистрироваться'}
		</button>

		<p class="text-sm text-center">
			Уже есть аккаунт? <a class="anchor" href="/login">Войти</a>
		</p>
	</div>
</div>
