<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import { page } from '$app/stores';

	interface Ad {
		id: string;
		title: string;
		description: string;
		price: number;
		author: string | { username: string; email?: string };
		authorId?: string;
		created_at: string;
		photos?: string[];
		characteristics?: Record<string, string>;
	}

	let ad: Ad | null = null;
	let loading = true;
	let error = '';
	let activePhoto = 0;
	let fullscreen = false;

	onMount(async () => {
		loading = true;
		error = '';
		try {
			const { id } = $page.params;
			ad = await api.get(`/api/ads/${id}`);
			if (!ad) {
				error = 'Объявление не найдено';
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Ошибка загрузки объявления';
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

	function openPhoto(idx: number) {
		activePhoto = idx;
		fullscreen = true;
	}
	function closeFullscreen() {
		fullscreen = false;
	}
	function prevPhoto() {
		if (!ad?.photos) return;
		activePhoto = (activePhoto - 1 + ad.photos.length) % ad.photos.length;
	}
	function nextPhoto() {
		if (!ad?.photos) return;
		activePhoto = (activePhoto + 1) % ad.photos.length;
	}
	function contactSeller() {
		if (ad && typeof ad.author === 'object' && ad.author.email) {
			window.location.href = `mailto:${ad.author.email}`;
		} else {
			alert('Контакт продавца недоступен');
		}
	}
</script>

<div class="container mx-auto py-10">
	{#if loading}
		<div class="text-center">Загрузка...</div>
	{:else if error}
		<div class="alert variant-filled-error">{error}</div>
	{:else if ad}
		<div class="ad-page grid md:grid-cols-2 gap-8">
			<!-- Фото -->
			<div>
				{#if ad.photos && ad.photos.length > 0}
					<div class="photo-gallery">
						<button
							type="button"
							aria-label="Открыть фото"
							class="main-photo-btn"
							on:click={() => openPhoto(activePhoto)}
							tabindex="0"
							on:keydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') openPhoto(activePhoto);
							}}
						>
							<img src={ad.photos[activePhoto]} alt="Фото объявления" class="main-photo" />
						</button>
						<div class="thumbnails flex gap-2 mt-2">
							{#each ad.photos as photo, idx}
								<button
									type="button"
									aria-label={`Показать фото ${idx + 1}`}
									class="thumb-btn {activePhoto === idx ? 'active' : ''}"
									on:click={() => (activePhoto = idx)}
									tabindex="0"
									on:keydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') activePhoto = idx;
									}}
								>
									<img src={photo} alt="Фото" class="thumb" width="48" height="48" />
								</button>
							{/each}
						</div>
					</div>
					{#if fullscreen}
						<div class="fullscreen-overlay" role="dialog" aria-modal="true">
							<button
								class="nav prev"
								aria-label="Предыдущее фото"
								on:click|stopPropagation={prevPhoto}
								tabindex="0">&lt;</button
							>
							<img src={ad.photos[activePhoto]} alt="Фото" class="fullscreen-photo" />
							<button
								class="nav next"
								aria-label="Следующее фото"
								on:click|stopPropagation={nextPhoto}
								tabindex="0">&gt;</button
							>
							<button
								class="close"
								aria-label="Закрыть"
								on:click|stopPropagation={closeFullscreen}
								on:keydown={(e) => {
									if (e.key === 'Escape') closeFullscreen();
								}}
								tabindex="0">×</button
							>
						</div>
					{/if}
				{:else}
					<div class="no-photo">Нет фото</div>
				{/if}
			</div>
			<!-- Детали -->
			<div class="flex flex-col gap-4">
				<h1 class="h2">{ad.title}</h1>
				<div class="text-lg text-surface-500">{ad.description}</div>
				<div class="price text-2xl font-bold">{ad.price.toLocaleString('ru-RU')} ₽</div>
				<div class="author text-surface-400">
					Продавец: <a href={`/profile/${ad.authorId}`}>@{getAuthorName(ad)}</a>
				</div>
				<div class="created text-xs text-surface-400">
					Опубликовано: {new Date(ad.created_at).toLocaleString()}
				</div>
				{#if ad.characteristics}
					<div class="characteristics mt-4">
						<h3 class="h4 mb-2">Характеристики</h3>
						<ul>
							{#each Object.entries(ad.characteristics) as [key, value]}
								<li><strong>{key}:</strong> {value}</li>
							{/each}
						</ul>
					</div>
				{/if}
				<button class="btn variant-filled-primary mt-6" on:click={contactSeller}
					>Связаться с продавцом</button
				>
			</div>
		</div>
	{/if}
</div>

<style>
	.ad-page {
		align-items: flex-start;
	}
	.photo-gallery {
		position: relative;
	}
	.main-photo {
		width: 100%;
		max-width: 480px;
		border-radius: 12px;
		box-shadow: 0 2px 8px #0002;
	}
	.thumbnails .thumb {
		border-radius: 6px;
		border: 2px solid transparent;
		cursor: pointer;
		width: 48px;
		height: 48px;
		object-fit: cover;
	}
	.fullscreen-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	.fullscreen-photo {
		max-width: 90vw;
		max-height: 80vh;
		border-radius: 12px;
		box-shadow: 0 2px 16px #0008;
	}
	.fullscreen-overlay .nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		font-size: 2rem;
		background: none;
		border: none;
		color: #fff;
		cursor: pointer;
		z-index: 1001;
	}
	.fullscreen-overlay .prev {
		left: 2vw;
	}
	.fullscreen-overlay .next {
		right: 2vw;
	}
	.fullscreen-overlay .close {
		position: absolute;
		top: 2vh;
		right: 4vw;
		font-size: 2.5rem;
		background: none;
		border: none;
		color: #fff;
		cursor: pointer;
		z-index: 1002;
	}
	.no-photo {
		width: 100%;
		height: 320px;
		background: #222;
		color: #888;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		font-size: 1.2rem;
	}
	.main-photo-btn {
		padding: 0;
		border: none;
		background: none;
		width: 100%;
		max-width: 480px;
		border-radius: 12px;
		display: block;
		cursor: pointer;
	}
	.thumb-btn {
		padding: 0;
		border: none;
		background: none;
		border-radius: 6px;
		cursor: pointer;
		outline: none;
	}
</style>
