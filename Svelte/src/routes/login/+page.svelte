<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { authToken, user as userStore } from '$lib/stores/auth';

	let username = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		if (!username || !password) {
			error = 'Все поля обязательны для заполнения';
			return;
		}
		error = '';
		loading = true;
		try {
			const tokenResponse = await api.post('/api/auth/login', { username, password });
			authToken.set(tokenResponse.access_token);

			const userProfile = await api.get('/api/auth/me');
			userStore.set(userProfile);

			await goto('/');
		} catch (e: any) {
			error = e.data?.message || 'Произошла ошибка при входе';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto flex h-full items-center justify-center">
	<div class="card p-4 md:p-8 space-y-4 w-full max-w-md">
		<!-- svelte-ignore a11y-autofocus -->
		<h2 class="h2 text-center">Вход</h2>

		<label class="label">
			<span>Имя пользователя</span>
			<input class="input" type="text" bind:value={username} placeholder="username" required />
		</label>
		<label class="label">
			<span>Пароль</span>
			<input class="input" type="password" bind:value={password} placeholder="••••••••" required />
		</label>

		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}

		<button class="btn variant-filled-primary w-full" on:click={handleLogin} disabled={loading}>
			{loading ? 'Загрузка...' : 'Войти'}
		</button>
		<p class="text-sm text-center">
			Нет аккаунта? <a class="anchor" href="/register">Зарегистрироваться</a>
		</p>
	</div>
</div>
