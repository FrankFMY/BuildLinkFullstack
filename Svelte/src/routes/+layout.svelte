<script lang="ts">
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { user, authToken, logout, loadUserProfile } from '$lib/stores/auth';
	import UserMenu from '$lib/components/UserMenu.svelte';

	onMount(async () => {
		const token = localStorage.getItem('jwt_token');
		if (token && !$user) {
			authToken.set(token);
			try {
				await loadUserProfile();
			} catch (error) {
				console.error('Ошибка загрузки профиля:', error);
				logout();
			}
		}
	});
</script>

<svelte:head>
	<title>BuildLink</title>
</svelte:head>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/" class="text-xl uppercase font-bold">BuildLink</a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if $user}
					<a href="/ads/create" class="btn btn-sm variant-filled-secondary mr-2"
						>Создать объявление</a
					>
					<UserMenu />
				{:else}
					<a href="/login" class="btn btn-sm variant-ghost">Войти</a>
					<a href="/register" class="btn btn-sm variant-filled-primary">Регистрация</a>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<div class="p-4">
		<slot />
	</div>
</AppShell>
