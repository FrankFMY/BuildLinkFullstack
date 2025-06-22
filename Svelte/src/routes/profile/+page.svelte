<script lang="ts">
	import { onMount } from 'svelte';
	import { user, authToken } from '$lib/stores/auth';
	import { api } from '$lib/utils/api';
	import AvatarUploader from '$lib/components/AvatarUploader.svelte';
	import { get } from 'svelte/store';

	let currentUser = get(user);
	let token: string | undefined = get(authToken) || undefined;
	let ads: any[] = [];
	let loading = true;
	let error = '';
	let successMsg = '';

	onMount(async () => {
		try {
			// Получаем свои объявления
			const res = await api.get(`/ads?author=${currentUser?.id}`, token);
			ads = (res || []).sort(
				(a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		} catch (e: any) {
			error = e?.data?.error || e?.data?.message || e?.message || 'Ошибка';
		} finally {
			loading = false;
		}
	});

	function onAvatarChange(e: CustomEvent<{ avatar: string }>) {
		if (!currentUser) return;
		currentUser = { ...currentUser, avatar: e.detail.avatar };
		user.update((u) => (u ? { ...u, avatar: e.detail.avatar } : u));
		successMsg = e.detail.avatar ? 'Аватар обновлён' : 'Аватар удалён';
		setTimeout(() => (successMsg = ''), 2000);
	}

	function goToSettings() {
		window.location.href = '/profile/settings';
	}
</script>

<div class="profile">
	{#if successMsg}
		<div class="success-msg">{successMsg}</div>
	{/if}
	<div class="avatar-block">
		<AvatarUploader avatarUrl={currentUser?.avatar || ''} {token} on:change={onAvatarChange} />
		<div class="user-info">
			<h2>{currentUser?.username}</h2>
			<div>Email: {currentUser?.email}</div>
			<div>Телефон: {currentUser?.phone || '—'}</div>
			<div>Город: {currentUser?.city || '—'}</div>
			<div>Таймзона: {currentUser?.timezone || '—'}</div>
			<button class="btn btn-sm variant-filled settings-btn" on:click={goToSettings}
				>Настройки</button
			>
		</div>
	</div>
	<div class="ads-list">
		<h3>Мои объявления</h3>
		{#if loading}
			<div>Загрузка...</div>
		{:else if error}
			<div class="error">{error}</div>
		{:else if ads.length === 0}
			<div>Нет объявлений</div>
		{:else}
			{#each ads as ad}
				<div class="ad-card">
					<div>
						<b>{ad.title}</b>
						<span style="color:#aaa;">{new Date(ad.createdAt).toLocaleString()}</span>
					</div>
					<div>{ad.description}</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.profile {
		max-width: 600px;
		margin: 2rem auto;
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
	.ads-list {
		margin-top: 2rem;
	}
	.ad-card {
		background: #181828;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
	}
	.settings-btn {
		margin-top: 1rem;
	}
	.success-msg {
		background: #2e7d32;
		color: #fff;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		text-align: center;
		font-size: 1.1em;
	}
</style>
