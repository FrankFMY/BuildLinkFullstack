<script lang="ts">
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';
	import { onMount } from 'svelte';
	import { user as userStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';

	let userId = '';
	let userProfile: any = null;
	let ads: any[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		userId = $page.params.id;
		const currentUser = get(userStore);
		if (currentUser && userId === currentUser.id) {
			goto('/profile');
			return;
		}
		loading = true;
		error = '';
		try {
			userProfile = await api.get(`/api/users/${userId}`);
			const res = await api.get(`/api/ads?author=${userId}`);
			ads = (res || [])
				.map((ad: any) => ({
					id: ad._id || ad.id,
					title: ad.title,
					description: ad.description,
					price: ad.price ?? 0,
					created_at: ad.createdAt || ad.created_at || ''
				}))
				.sort(
					(a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
		} catch (e: any) {
			error = e?.data?.error || e?.data?.message || e?.message || 'Ошибка';
		} finally {
			loading = false;
		}
	});
</script>

<div class="profile">
	{#if loading}
		<div>Загрузка профиля...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if !userProfile}
		<div>Пользователь не найден</div>
	{:else}
		<div class="avatar-block">
			<img
				class="preview"
				src={userProfile.avatar || '/static/avatar.png'}
				alt="avatar"
				width="96"
				height="96"
			/>
			<div class="user-info">
				<h2>{userProfile.username}</h2>
				<div>Email: {userProfile.email}</div>
				<div>Телефон: {userProfile.phone || '—'}</div>
				<div>Город: {userProfile.city || '—'}</div>
				<div>Таймзона: {userProfile.timezone || '—'}</div>
			</div>
		</div>
	{/if}
</div>

{#if !loading && !error && userProfile}
	<div class="ads-section">
		<h3>Объявления пользователя</h3>
		{#if ads.length === 0}
			<div>Нет объявлений</div>
		{:else}
			<div class="ads-grid">
				{#each ads as ad}
					<div class="card p-4 shadow-md flex flex-col gap-2">
						<h2 class="h4">{ad.title}</h2>
						<p class="text-sm text-surface-500 flex-grow">{ad.description}</p>
						<div class="flex justify-between items-center mt-2">
							<span class="font-bold text-lg">{ad.price.toLocaleString('ru-RU')} ₽</span>
							<span class="text-xs text-surface-400"
								>{new Date(ad.created_at).toLocaleString()}</span
							>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.profile {
		max-width: 600px;
		margin: 2rem auto 0 auto;
		background: #23223a;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 12px #0002;
	}
	.avatar-block {
		display: flex;
		align-items: center;
		gap: 2rem;
	}
	.user-info {
		flex: 1;
	}
	.ads-section {
		max-width: 900px;
		margin: 2rem auto;
		background: #23223a;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 12px #0002;
	}
	.ads-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}
	@media (min-width: 700px) {
		.ads-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (min-width: 1100px) {
		.ads-grid {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}
	.card {
		background: #181828;
		border-radius: 8px;
		padding: 1rem;
	}
	.error {
		background: #c62828;
		color: #fff;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		text-align: center;
		font-size: 1.1em;
	}
</style>
