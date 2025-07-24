<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/utils/api';
	import type { Ad } from '$lib/stores/auth';

	let ads: Ad[] = [];
	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			const rawAds = await api.get('/api/ads');
			ads = rawAds.map((ad: unknown) => {
				const a = ad as Ad;
				return {
					id: a.id,
					title: a.title,
					description: a.description,
					price: a.price ?? 0,
					author: a.author,
					authorId: a.authorId || '',
					created_at: a.created_at || ''
				};
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
	{:else if ads.length === 0}
		<div class="text-center">
			<p>Объявлений пока нет. Станьте первым!</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each ads as ad}
				<div class="card p-4 shadow-md hover:shadow-xl transition-shadow flex flex-col gap-2">
					<h2 class="h4">{ad.title}</h2>
					<p class="text-sm text-surface-500 flex-grow">{ad.description}</p>
					<div class="flex justify-between items-center mt-2">
						<span class="font-bold text-lg">{ad.price.toLocaleString('ru-RU')} ₽</span>
						<a class="author-link text-xs text-surface-400" href={`/profile/${ad.authorId}`}
							>@{ad.author}</a
						>
					</div>
				</div>
			{/each}
		</div>
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
</style>
