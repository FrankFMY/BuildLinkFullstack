<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import type { Ad } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { user, loadUserProfile } from '$lib/stores/auth';

	let ads: Ad[] = [];
	let loading = true;
	let error = '';
	let showMine = false;
	let showWithPhoto = false;

	// Добавляем переменную для отслеживания загрузки пользователя
	let userLoaded = false;

	// Подписываемся на изменения пользователя
	$: {
		if ($user !== undefined) {
			userLoaded = true;
		}
	}

	onMount(async () => {
		try {
			// Загружаем профиль пользователя, если есть токен
			await loadUserProfile();

			const rawAds = await api.get('/api/ads');
			console.log('Raw ads from API:', rawAds);
			ads = rawAds.map((ad: unknown) => {
				const a = ad as Ad;
				const mappedAd = {
					id: a.id,
					title: a.title,
					description: a.description,
					price: a.price ?? 0,
					author: a.author,
					authorId: a.authorId || '',
					created_at: a.created_at || '',
					photos: a.photos || []
				};
				console.log('Mapped ad:', mappedAd);
				return mappedAd;
			});
		} catch (e: unknown) {
			if (e instanceof Error) {
				error = e.message;
			} else {
				error = 'Произошла неизвестная ошибка';
			}
		} finally {
			loading = false;
		}
	});

	function getAuthorName(ad: Ad): string {
		if (ad && typeof ad.author === 'object' && ad.author !== null && 'username' in ad.author) {
			return (ad.author as { username: string }).username;
		}
		return String(ad.author || '—');
	}

	$: filteredAds = ads.filter((ad) => {
		// Отладка фильтрации
		if (showMine) {
			console.log('Filtering - User ID:', $user?.id);
			console.log('Ad authorId:', ad.authorId);
			console.log('Ad author object:', ad.author);

			if (!$user?.id) return false;
			// Приводим к строке для надежного сравнения
			const userId = String($user.id);
			const adAuthorId = String(ad.authorId || '');
			// Проверяем альтернативный способ получения ID автора
			const authorIdFromObject =
				ad.author && typeof ad.author === 'object' && 'id' in ad.author
					? String((ad.author as any).id || (ad.author as any)._id || '')
					: '';

			console.log('Comparing:', { userId, adAuthorId, authorIdFromObject });
			// Сравниваем оба варианта ID
			if (adAuthorId !== userId && authorIdFromObject !== userId) return false;
		}

		// Затем применяем фильтр "только с фото"
		if (showWithPhoto && (!ad.photos || ad.photos.length === 0)) return false;

		return true;
	});
</script>

<div class="container mx-auto py-10">
	<h1 class="h2 mb-8 text-center">BuildLink — маркетплейс объявлений</h1>

	{#if loading}
		<div class="text-center">
			<p>Загрузка объявлений...</p>
		</div>
	{:else if error}
		<div class="alert variant-filled-error">
			<p><strong>Ошибка:</strong> {error}</p>
		</div>
	{:else}
		<div class="flex gap-4 mb-6">
			{#if userLoaded && $user}
				<label><input type="checkbox" bind:checked={showMine} /> Только свои</label>
			{/if}
			<label><input type="checkbox" bind:checked={showWithPhoto} /> Только с фото</label>
		</div>
		{#if filteredAds.length === 0}
			<div class="text-center p-8">
				{#if showMine && (!$user || !userLoaded)}
					<p>Для просмотра своих объявлений необходимо войти в систему</p>
				{:else if showMine}
					<p>У вас пока нет объявлений</p>
				{:else}
					<p>Нет объявлений, соответствующих выбранным фильтрам</p>
				{/if}
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredAds as ad}
					<div
						class="card ad-card p-4 shadow-md transition-transform duration-200 flex flex-col gap-2 cursor-pointer"
						on:click={() => goto(`/ads/${ad.id}`)}
						tabindex="0"
						role="button"
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') goto(`/ads/${ad.id}`);
						}}
					>
						{#if ad.photos && ad.photos.length > 0}
							<div class="ad-photo-wrapper">
								<img src={ad.photos[0]} alt="Фото объявления" class="ad-photo" />
							</div>
						{:else}
							<div
								class="ad-photo-wrapper bg-surface-800 flex items-center justify-center text-surface-400"
							>
								<span>Нет фото</span>
							</div>
						{/if}
						<h2 class="h4">{ad.title}</h2>
						<p class="text-sm text-surface-500 flex-grow">{ad.description}</p>
						<div class="flex justify-between items-center mt-2">
							<span class="font-bold text-lg">{ad.price.toLocaleString('ru-RU')} ₽</span>
							<a
								class="author-link text-xs text-surface-400"
								href={`/profile/${ad.authorId}`}
								on:click|stopPropagation>{'@' + getAuthorName(ad)}</a
							>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.author-link {
		color: #aaa;
		text-decoration: underline;
		cursor: pointer;
		transition: color 0.2s;
	}
	.author-link:hover {
		color: #fff;
	}
	.ad-card {
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}
	.ad-card:hover,
	.ad-card:focus {
		transform: scale(1.03);
		box-shadow: 0 6px 24px #0003;
		z-index: 2;
	}
	.ad-photo-wrapper {
		width: 100%;
		aspect-ratio: 16/9;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 0.5rem;
		background: #23223a;
	}
	.ad-photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
