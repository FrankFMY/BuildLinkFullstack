<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { user, authToken } from '$lib/stores/auth';
	import { api } from '$lib/utils/api';
	import AvatarUploader from '$lib/components/AvatarUploader.svelte';
	import { get } from 'svelte/store';

	let currentUser: any = null;
	let token: string | undefined = get(authToken) || undefined;
	let ads: any[] = [];
	let loading = false;
	let error = '';
	let successMsg = '';
	let showAdModal = false;
	let editAd: any = null;

	const unsubscribe = user.subscribe((u) => {
		currentUser = u;
	});
	onDestroy(unsubscribe);

	$: if (currentUser && currentUser._id && !currentUser.id) {
		currentUser.id = currentUser._id;
	}

	$: if (currentUser && currentUser.id) {
		loadAds();
	}

	let adsLoadedForUser = '';
	async function loadAds() {
		if (adsLoadedForUser === currentUser.id) return;
		loading = true;
		error = '';
		try {
			const res = await api.get(`/api/ads?author=${currentUser.id}`, token);
			ads = (res || [])
				.map((ad: any) => ({
					id: ad._id || ad.id,
					title: ad.title,
					description: ad.description,
					price: ad.price ?? 0,
					author: ad.author?.username || ad.author || '—',
					created_at: ad.createdAt || ad.created_at || ''
				}))
				.sort(
					(a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
			adsLoadedForUser = currentUser.id;
		} catch (e: any) {
			error = e?.data?.error || e?.data?.message || e?.message || 'Ошибка';
			console.error('ads error:', e);
		} finally {
			loading = false;
		}
	}

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

	function openCreateAd() {
		editAd = null;
		showAdModal = true;
	}
	function openEditAd(ad: any) {
		editAd = ad;
		showAdModal = true;
	}
	function closeAdModal() {
		showAdModal = false;
		editAd = null;
	}
	function deleteAd(adId: string) {
		// TODO: реализовать удаление через API
		alert('Удаление объявления: ' + adId);
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
</div>

<div class="ads-section">
	<h3>Мои объявления</h3>
	<button class="btn btn-sm variant-filled" on:click={openCreateAd}>Добавить объявление</button>
	{#if loading}
		<div>Загрузка...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if ads.length === 0}
		<div>Нет объявлений</div>
	{:else}
		<div class="ads-grid">
			{#each ads as ad}
				<div class="card p-4 shadow-md flex flex-col gap-2">
					<h2 class="h4">{ad.title}</h2>
					<p class="text-sm text-surface-500 flex-grow">{ad.description}</p>
					<div class="flex justify-between items-center mt-2">
						<span class="font-bold text-lg">{ad.price.toLocaleString('ru-RU')} ₽</span>
						<span class="text-xs text-surface-400">{new Date(ad.created_at).toLocaleString()}</span>
					</div>
					<div class="ad-actions mt-2">
						<button class="btn btn-xs" on:click={() => openEditAd(ad)}>Редактировать</button>
						<button class="btn btn-xs variant-filled-error" on:click={() => deleteAd(ad.id)}
							>Удалить</button
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	{#if showAdModal}
		<div
			class="modal-backdrop"
			role="button"
			tabindex="0"
			on:click={closeAdModal}
			on:keydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') closeAdModal();
			}}
		></div>
		<div class="modal">
			<h4>{editAd ? 'Редактировать объявление' : 'Новое объявление'}</h4>
			<!-- TODO: форма создания/редактирования объявления -->
			<button class="btn" on:click={closeAdModal}>Закрыть</button>
		</div>
	{/if}
</div>

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
	.ad-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
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
	.error {
		background: #c62828;
		color: #fff;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		text-align: center;
		font-size: 1.1em;
	}
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #23223a;
		padding: 2rem;
		border-radius: 12px;
		z-index: 1001;
		min-width: 320px;
		max-width: 90vw;
	}
</style>
